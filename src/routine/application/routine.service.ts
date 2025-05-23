import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { User } from '../../user/domain/User.entity';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { RoutineResponseDto } from '../dto/routine.response.dto';
import { Transactional } from 'typeorm-transactional';
import { GetAllRoutineByUserResponseDto } from '../dto/getAllRoutineByUser.response.dto';
import { GroupedRoutine, routineGroupByName } from '../functions/routineGroupByName';

export class RoutineService {
  constructor(
    @Inject(ROUTINE_REPOSITORY)
    private readonly routineRepository: RoutineRepository,
    readonly exerciseService: ExerciseService,
  ) {}

  @Transactional()
  async bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto) {
    const { routines } = saveRoutines;
    const routineName = routines[0].routineName;
    const isExistRoutine = await this.routineRepository.findRoutinesByNameLockMode(routineName, user);

    if (isExistRoutine.length > 0) {
      throw new BadRequestException('Routine already exists');
    }
    const exercises = routines.map(({ exerciseName, bodyPart }) => ({ exerciseName, bodyPart }));
    const newExercises = await this.exerciseService.findNewExercises({ exercises });
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPart(exercises);
    const newRoutines = await Promise.all(
      routines.map(async (routine) => {
        const { routineName, exerciseName, bodyPart } = routine;

        const exercise = exerciseEntities.find(
          (entity) => entity.exerciseName === exerciseName && entity.bodyPart === bodyPart,
        );
        if (!exercise) {
          throw new NotFoundException(`exercise (${exerciseName}, ${bodyPart}) can not found. `);
        }
        return new Routine({ name: routineName, user: user, exercise: exercise });
      }),
    );
    const savedRoutines = await this.routineRepository.bulkInsertRoutines(newRoutines);
    return savedRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  async getRoutineByName(getRoutineByNameRequest: GetRoutineByNameRequestDto, user: User) {
    const { name } = getRoutineByNameRequest;
    const foundRoutines = await this.routineRepository.findRoutinesByName(name, user);
    if (foundRoutines.length == 0) {
      throw new NotFoundException(`Routines not found`);
    }
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  @Transactional()
  async bulkUpdateRoutines(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
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
}
