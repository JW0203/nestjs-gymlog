import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>,
  ) {}

  async findByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: ExerciseDataFormatDto) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async findAll(exercisesData: ExerciseDataFormatDto[]) {
    const exercises = exercisesData.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      bodyPart: exercise.bodyPart,
    }));
    return await this.exerciseRepository.find({ where: exercises });
  }

  async findNewExercises(exerciseDataArray: SaveExercisesRequestDto) {
    try {
      const exerciseData = exerciseDataArray.exercises;
      const foundExercise = await this.findAll(exerciseData);
      if (foundExercise.length < 1) {
        return exerciseData;
      }
      const existingMap = new Map(foundExercise.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      const newExercises = exerciseData.filter((ex) => !existingMap.has(ex.bodyPart + ex.exerciseName));
      return newExercises.map((exercise) => new ExerciseDataResponseDto(exercise));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error while finding new exercises: ${error.message}`);
      }
      throw new Error(`Unknown Error occurred while finding new exercises`);
    }
  }

  async bulkInsertExercises(exerciseDataArray: SaveExercisesRequestDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const exerciseData = exerciseDataArray.exercises;
      const exerciseEntities = exerciseData.map(
        (exercise) =>
          new Exercise({
            exerciseName: exercise.exerciseName,
            bodyPart: exercise.bodyPart,
          }),
      );
      const foundExercises = await queryRunner.manager.find(Exercise, {
        where: exerciseEntities.map((entity) => ({
          exerciseName: entity.exerciseName,
          bodyPart: entity.bodyPart,
        })),
        lock: { mode: 'pessimistic_write' },
      });

      if (foundExercises.length > 0) {
        throw new ConflictException('Some or all exercises already exist. No new data was saved.');
      }
      const insertResults = await queryRunner.manager.insert(Exercise, exerciseEntities);
      const ids = insertResults.identifiers.map((data) => data.id);
      const newFoundExercises = await queryRunner.manager.findBy(Exercise, { id: In(ids) });
      await queryRunner.commitTransaction();
      return newFoundExercises.map((exercise) => new ExerciseDataResponseDto(exercise));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Transactional()
  async softDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    const { ids } = deleteExerciseRequestDto;
    const foundExercises = await this.exerciseRepository.find({ where: { id: In(ids) } });
    if (ids.length === foundExercises.length) {
      throw new BadRequestException(`Some exercises do not exist in the exercise entity.`);
    }
    await this.exerciseRepository.softDelete(ids);
  }
}
