import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../user/domain/User.entity';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SoftDeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { RoutineResponseDto } from '../dto/routine.response.dto';
import { Transactional } from 'typeorm-transactional';
import { GetAllRoutineByUserResponseDto } from '../dto/getAllRoutineByUser.response.dto';
import { GroupedRoutine, routineGroupByName } from '../functions/routineGroupByName';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { SaveRoutineResponseDto } from '../dto/saveRoutine.response.dto';
import { SaveRoutineExerciseRequestDto } from '../../routineExercise/dto/saveRoutineExercise.request.dto';
import { RoutineExerciseService } from '../../routineExercise/application/routineExercise.service';
import { FindDataByRoutineIdRequestDto } from '../../routineExercise/dto/findDataByRoutineId.request.dto';
import { FindDataByRoutineIdResponseDto } from '../../routineExercise/dto/fineDataByRoutineId.response.dto';
import { OderAndExercise } from '../dto/oderAndExercise.dto';

@Injectable()
export class RoutineService {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,

    readonly exerciseService: ExerciseService,

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
      ({ order, exercise }) => {
        return {
          order,
          exercise: new Exercise({ exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart }),
          routine: savedRoutine,
        };
      },
    );

    await this.routineExerciseService.saveRoutineExercises(saveDataRequestToRoutineExercise);

    return new SaveRoutineResponseDto(savedRoutine);
  }

  async getRoutineByName(
    getRoutineByNameRequest: GetRoutineByNameRequestDto,
    user: User,
  ): Promise<FindDataByRoutineIdResponseDto> {
    console.log(getRoutineByNameRequest);
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
    const { id, routineName, updateData } = updateRoutineRequest;

    const foundRoutine = await this.routineRepository.findOneRoutineById(id, user);
    if (!foundRoutine) {
      throw new NotFoundException(`Routine can not found using the given id(${id}).`);
    }
    const foundRoutineName = foundRoutine.name;
    let nameUpdated = false;
    if (foundRoutineName !== routineName) {
      foundRoutine.update({ name: routineName, user });
      await this.routineRepository.saveRoutine(foundRoutine);
      nameUpdated = true;
    }

    const updatedRoutine = await this.routineRepository.findOneRoutineByName(routineName, user);
    if (!updatedRoutine) {
      throw new NotFoundException(`Routine name was not updated into given ${routineName}.`);
    }
    const orderAndExercises: OderAndExercise[] = updateData.map(({ order, exerciseName, bodyPart }) => {
      return {
        order: order,
        exercise: { exerciseName, bodyPart },
      };
    });

    const result = await this.routineExerciseService.updateRoutineExercise(updatedRoutine, orderAndExercises);
    if (result.type === 'UPDATED') {
      return { updated: result.data };
    } else {
      if (nameUpdated) {
        return { updated: { updatedRoutineName: routineName, previousRoutineName: foundRoutineName } };
      }
      return { updated: 'Nothing' };
    }
  }

  async getAllRoutinesByUser(user: User): Promise<FindDataByRoutineIdResponseDto[]> {
    const userRoutines = await this.routineRepository.findAllByUserId(user.id);
    if (userRoutines.length === 0) {
      return Promise.resolve<FindDataByRoutineIdResponseDto[]>([]);
    }
    const routineIds = userRoutines.map((routine) => routine.id);

    return await this.routineExerciseService.findAllRoutineExercisesByRoutineIds({
      ids: routineIds,
    });
  }

  async softDeleteRoutine(deleteRoutineRequestDto: SoftDeleteRoutineRequestDto, user: User): Promise<void> {
    const { id } = deleteRoutineRequestDto;
    const routines = await this.routineRepository.findOneRoutineById(id, user);
    if (!routines) {
      return;
    }

    await this.routineExerciseService.softDeleteRoutineExercise(id);
    await this.routineRepository.softDeleteRoutine(id);

    const checkRoutines = await this.routineRepository.findOneRoutineById(id, user);
    if (checkRoutines) {
      throw new BadRequestException(`Routine is not deleted`);
    }
  }
}
