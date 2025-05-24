import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../../user/domain/User.entity';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
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
    const { routineName, exercises } = saveRoutineRequestDto;
    const newRoutine = new Routine({ user, name: routineName });
    const savedRoutine = await this.routineRepository.saveRoutine(newRoutine);
    const saveDataRequestToRoutineExercise: SaveRoutineExerciseRequestDto[] = exercises.map((exercise, index) => {
      return {
        order: index + 1,
        exercise: new Exercise(exercise),
        routine: newRoutine,
      };
    });
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
    const requestDataByRoutineId: FindDataByRoutineIdRequestDto = { id: foundRoutine.id };
    return await this.routineExerciseService.findRoutineExercisesByRoutineId(requestDataByRoutineId);
  }

  /*
  @Transactional()
  async updateRoutine(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
    const { updateData } = updateRoutineRequest;
    const exercises = updateData.map(({ exerciseName, bodyPart }) => ({ exerciseName, bodyPart }));

    const newExercises = await this.exerciseService.findNewExercises({ exercises });
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const foundExercises = await this.exerciseService.findExercisesByExerciseNameAndBodyPart(exercises);

    if (foundExercises.length === 0) {
      throw new NotFoundException('exercises can not found');
    }
    const updatedIds: number[] = [];
    const promiseUpdateRoutine = await Promise.all(
      updateData.map(async (updateRoutine) => {
        const { routineName, id, exerciseName, bodyPart } = updateRoutine;
        updatedIds.push(id);
        const exercise = foundExercises.find(
          (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
        );
        if (!exercise) {
          throw new NotFoundException(`${exerciseName}, ${bodyPart} can not find`);
        }
        const foundRoutine = await this.routineRepository.findOneRoutineById(id, user);
        if (!foundRoutine) {
          throw new NotFoundException(`Routine with id ${id} not found.`);
        }
        foundRoutine.update({
          name: routineName,
          exercise,
          user,
        });
        return foundRoutine;
      }),
    );
    const updateRoutines = await Promise.all(promiseUpdateRoutine);
    await this.routineRepository.bulkUpdateRoutines(updateRoutines);
    const foundRoutines = await this.routineRepository.findRoutinesByIds(updatedIds, user);
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  async softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User) {
    const { ids } = deleteRoutineRequestDto;
    const routines = await this.routineRepository.findRoutinesByIds(ids, user);
    if (routines.length === 0) {
      return;
    }
    const routineIds = routines.map((routine) => {
      return routine.id;
    });
    await this.routineRepository.softDeleteRoutines(routineIds);
  }
  async findAllRoutinesByUserId(user: User): Promise<GetAllRoutineByUserResponseDto[]> {
    const userRoutines = await this.routineRepository.findAllByUserId(user.id);
    if (userRoutines.length === 0) {
      return Promise.resolve<GetAllRoutineByUserResponseDto[]>([]);
    }
    return userRoutines.map((routine) => new GetAllRoutineByUserResponseDto(routine));
  }
  async getAllRoutinesByUser(user: User): Promise<GroupedRoutine[]> {
    const userRoutines = await this.findAllRoutinesByUserId(user);
    if (userRoutines.length === 0) {
      return Promise.resolve<GroupedRoutine[]>([]);
    }
    return routineGroupByName(userRoutines);
  }

 */
}
