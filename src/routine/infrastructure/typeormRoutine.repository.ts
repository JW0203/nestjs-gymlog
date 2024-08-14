import { RoutineRepository } from '../domain/routine.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { RoutineResponseDto } from '../dto/routine.response.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { Transactional } from 'typeorm-transactional';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';

export class TypeormRoutineRepository implements RoutineRepository {
  constructor(
    @InjectRepository(Routine) private routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
  ) {}

  async bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto): Promise<RoutineResponseDto[]> {
    const { routineName, exercises, routines } = saveRoutines;
    const isExistRoutine = await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });
    if (isExistRoutine.length > 0) {
      throw new BadRequestException('Routine already exists');
    }
    const newExercises = await this.exerciseService.findNewExercises(saveRoutines);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }
    const requestFindExercises = exercises.map((exercise) => {
      return { exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart };
    });
    const exerciseEntities = await this.exerciseService.findExercisesByExerciseNameAndBodyPart({
      exercises: requestFindExercises,
      lock: false,
    });
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
    const insertResult = await this.routineRepository.insert(newRoutines);
    const ids: number[] = insertResult.identifiers.map((routine) => {
      return routine.id;
    });
    const foundRoutines = await this.routineRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'exercise'],
    });
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  async getRoutineByName(getRoutineRequest: GetRoutineRequestDto, user: User) {
    const { name } = getRoutineRequest;
    const foundRoutines = await this.routineRepository.find({
      where: { name, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  @Transactional()
  async bulkUpdateRoutines(updateRoutineRequest: UpdateRoutinesRequestDto, user: User) {
    const { routineName, updateData, exercises } = updateRoutineRequest;
    const isExistRoutine = await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });
    if (isExistRoutine.length === 0) {
      throw new BadRequestException('Routine is not exists');
    }
    const newExercises = await this.exerciseService.findNewExercises(updateRoutineRequest);
    if (newExercises.length > 0) {
      await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
    }

    const requestFindExercises = exercises.map((exercise) => {
      return { exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart };
    });

    const foundExercises = await this.exerciseService.findExercisesByExerciseNameAndBodyPart({
      exercises: requestFindExercises,
      lock: false,
    });

    if (foundExercises.length === 0) {
      throw new BadRequestException('exercises can not found');
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
        const foundRoutine = await this.routineRepository.findOne({ where: { id }, relations: ['user', 'exercise'] });
        if (!foundRoutine) {
          throw new BadRequestException(`Routine with id ${id} not found.`);
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
    await this.routineRepository.save(updateRoutines);
    const foundRoutines = await this.routineRepository.find({
      where: { id: In(updatedIds) },
      relations: ['exercise', 'user'],
    });
    return foundRoutines.map((routine) => new RoutineResponseDto(routine));
  }

  async softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User): Promise<any> {
    const { routineName } = deleteRoutineRequestDto;
    const routines = await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
    if (routines.length === 0) {
      throw new BadRequestException(`Routines not found`);
    }
    const routineIds = routines.map((routine) => {
      return routine.id;
    });
    await this.routineRepository.softDelete({ id: In(routineIds) });
  }
}
