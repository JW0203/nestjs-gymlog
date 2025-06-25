import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../user/domain/User.entity';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SoftDeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { Transactional } from 'typeorm-transactional';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { SaveRoutineResponseDto } from '../dto/saveRoutine.response.dto';
import { SaveRoutineExerciseRequestDto } from '../../routineExercise/dto/saveRoutineExercise.request.dto';
import { RoutineExerciseService } from '../../routineExercise/application/routineExercise.service';
import { FindDataByRoutineIdRequestDto } from '../../routineExercise/dto/findDataByRoutineId.request.dto';
import { FindDataByRoutineIdResponseDto } from '../../routineExercise/dto/fineDataByRoutineId.response.dto';
import { OderAndExercise } from '../dto/oderAndExercise.dto';
import { SoftDeleteRoutineExercisesRequestDto } from '../../routineExercise/dto/softDeleteRoutineExercises.request.dto';

@Injectable()
export class RoutineService {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    readonly routineExerciseService: RoutineExerciseService,
  ) {}

  @Transactional()
  async saveRoutine(saveRoutineRequestDto: SaveRoutineRequestDto, user: User): Promise<SaveRoutineResponseDto> {
    const { routineName, orderAndExercise } = saveRoutineRequestDto;

    const isRoutineName = await this.routineRepository.findOneRoutineByName(routineName, user);
    if (isRoutineName) {
      throw new BadRequestException(`The routine name (${routineName}) is already used`);
    }
    const newRoutine = new Routine({ user, name: routineName });
    const savedRoutine = await this.routineRepository.saveRoutine(newRoutine);
    const saveDataRequestToRoutineExercise: SaveRoutineExerciseRequestDto[] = orderAndExercise.map(
      ({ order, exerciseName, bodyPart }) => {
        return {
          order,
          exercise: new Exercise({ exerciseName, bodyPart }),
          routine: savedRoutine,
        };
      },
    );

    return await this.routineExerciseService.saveRoutineExercises(saveDataRequestToRoutineExercise);
  }

  async getRoutineByName(
    getRoutineByNameRequest: GetRoutineByNameRequestDto,
    user: User,
  ): Promise<FindDataByRoutineIdResponseDto> {
    const { name } = getRoutineByNameRequest;
    const foundRoutine = await this.routineRepository.findOneRoutineByName(name, user);
    if (!foundRoutine) {
      throw new NotFoundException(`Routines not found`);
    }
    const requestDataByRoutineId = new FindDataByRoutineIdRequestDto(foundRoutine.id);
    return await this.routineExerciseService.findRoutineExercisesByRoutineId(requestDataByRoutineId);
  }

  @Transactional()
  async updateRoutine(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
    const { routineId, routineName, updateData } = updateRoutineRequest;

    const routine = await this.routineRepository.findOneRoutineById(routineId, user);
    if (!routine) {
      throw new NotFoundException(`Routine can not found using the given id(${routineId}).`);
    }

    const isNameChanged = routine.name !== routineName;
    if (isNameChanged) {
      routine.update({ name: routineName, user });
      await this.routineRepository.saveRoutine(routine);
    }

    const orderAndExercises: OderAndExercise[] = updateData.map(({ order, exerciseName, bodyPart }) => {
      return { order, exerciseName, bodyPart };
    });

    const result = await this.routineExerciseService.updateRoutineExercise(routine, orderAndExercises);
    if (result.type === 'EXERCISE_UPDATED') {
      return { updated: result.data };
    }
    if (result.type === 'EXERCISE_NOT_UPDATED' && isNameChanged) {
      const returnData = {
        routineId: updateRoutineRequest.routineId,
        routineName: updateRoutineRequest.routineName,
        routines: updateRoutineRequest.updateData,
      };
      return { updated: returnData };
    }
    return { updated: 'Nothing' };
  }

  async getUserRoutines(user: User): Promise<Routine[]> {
    return await this.routineRepository.findAllByUserId(user.id);
  }

  async getAllRoutinesByUser(user: User): Promise<FindDataByRoutineIdResponseDto[]> {
    const userRoutines = await this.getUserRoutines(user);
    if (userRoutines.length === 0) {
      return Promise.resolve<FindDataByRoutineIdResponseDto[]>([]);
    }
    const routineIds = userRoutines.map((routine) => routine.id);

    return await this.routineExerciseService.findAllRoutineExercisesByRoutineIds({
      ids: routineIds,
    });
  }

  @Transactional()
  async softDeleteRoutines(deleteRoutineRequestDto: SoftDeleteRoutineRequestDto, user: User): Promise<void> {
    const { ids } = deleteRoutineRequestDto;

    const routines = await this.routineRepository.findRoutinesByIds(ids, user);
    if (routines.length === 0) {
      return;
    }

    const softDeleteRoutineExercisesRequest = new SoftDeleteRoutineExercisesRequestDto(ids);
    await this.routineExerciseService.softDeleteRoutineExercises(softDeleteRoutineExercisesRequest);
    await this.routineRepository.softDeleteRoutines(ids);
  }
}
