import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';
import { User } from '../../user/domain/User.entity';
import { GetRoutineRequestDto } from '../dto/getRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { RoutineResponseDto } from '../dto/routine.response.dto';

@Injectable()
export class RoutineService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Routine) private readonly routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
  ) {}

  @Transactional()
  async bulkInsertRoutines(user: User, saveRoutines: SaveRoutinesRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const isExistRoutine = await queryRunner.manager.find(Routine, {
        where: { name: saveRoutines.routineName, user: { id: user.id } },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (isExistRoutine) {
        throw new BadRequestException('Routine already exists');
      }
      const newExercises = await this.exerciseService.findNewExercises(saveRoutines);
      if (newExercises.length > 0) {
        console.log(newExercises);
        await this.exerciseService.bulkInsertExercises({ exercises: newExercises });
      }
      const exerciseEntities = await this.exerciseService.findAll(saveRoutines.exercises);
      const newRoutines = await Promise.all(
        saveRoutines.routines.map(async (routine) => {
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err);
    } finally {
      await queryRunner.release();
    }
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const isExistRoutine = await queryRunner.manager.find(Routine, {
        where: { name: updateRoutineRequest.routineName, user: { id: user.id } },
        relations: ['user'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!isExistRoutine) {
        throw new BadRequestException('Routine is not exists');
      }

      const NewExercises = await this.exerciseService.findNewExercises(updateRoutineRequest);
      if (NewExercises.length > 0) {
        await this.exerciseService.bulkInsertExercises({ exercises: NewExercises });
      }
      const exercises = await this.exerciseService.findAll(updateRoutineRequest.exercises);
      const promiseUpdatedIds = await Promise.all(
        updateRoutineRequest.updateData.map(async (updateRoutine) => {
          const { routineName, id, exerciseName, bodyPart } = updateRoutine;
          const exercise = exercises.find(
            (exercise) => exercise.exerciseName === exerciseName && exercise.bodyPart === bodyPart,
          );
          if (!exercise) {
            throw new NotFoundException(`${exerciseName}, ${bodyPart} can not find`);
          }

          await queryRunner.manager.update(Routine, id, { name: routineName, exercise, user });
          return id;
        }),
      );
      const foundRoutines = await queryRunner.manager.find(Routine, {
        where: { id: In(promiseUpdatedIds) },
        relations: ['exercise', 'user'],
      });
      return foundRoutines.map((routine) => new RoutineResponseDto(routine));
    } catch (errors) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(errors);
    } finally {
      await queryRunner.release();
    }
  }

  @Transactional()
  async softDeleteRoutines(deleteRoutineRequestDto: DeleteRoutineRequestDto, user: User) {
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
    await this.routineRepository.softDelete(routineIds);
  }
}
