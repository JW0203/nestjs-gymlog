import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Exercise } from '../domain/Exercise.entity';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';
import { ExerciseRepository } from '../domain/exercise.repository';
import { EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { GetExercisesRequestDto } from '../dto/getExercises.request.dto';
import { Transactional } from 'typeorm-transactional';
import { LockConfigManager } from '../../common/infrastructure/typeormMysql.lock';
import { FilteredExerciseDto } from '../dto/filteredExercise.dto';

@Injectable()
export class ExerciseService {
  constructor(
    @Inject(EXERCISE_REPOSITORY)
    private readonly exerciseRepository: ExerciseRepository,
  ) {}

  async findOneByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: ExerciseDataFormatDto) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    const foundExercise = await this.exerciseRepository.findOneByExerciseNameAndBodyPart(exerciseName, bodyPart);
    if (!foundExercise) {
      throw new NotFoundException(`Exercise '${exerciseName}' not found`);
    }
    return new ExerciseDataResponseDto(foundExercise);
  }

  async findAll() {
    const allExercises = await this.exerciseRepository.findAll();
    if (allExercises.length === 0) {
      throw new NotFoundException('No exercise data in Exercise entity');
    }
    return allExercises.map((exercise) => {
      return new ExerciseDataResponseDto(exercise);
    });
  }

  async findExercisesByExerciseNameAndBodyPart(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]> {
    const exercisesRequest: ExerciseDataFormatDto[] = exercises.map((exercise) => {
      return { exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart };
    });
    return await this.exerciseRepository.findExercisesByExerciseNameAndBodyPart(exercisesRequest);
  }

  async findExercisesByExerciseNameAndBodyPartLockMode(exercises: ExerciseDataFormatDto[]): Promise<Exercise[]> {
    const lockMode = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });
    const exercisesRequest: ExerciseDataFormatDto[] = exercises.map((exercise) => {
      return { exerciseName: exercise.exerciseName, bodyPart: exercise.bodyPart };
    });
    return await this.exerciseRepository.findExercisesByExerciseNameAndBodyPartLockMode(exercisesRequest, lockMode);
  }

  async findNewExercises(getExercisesRequest: GetExercisesRequestDto) {
    try {
      const { exercises } = getExercisesRequest;
      const foundExercise = await this.exerciseRepository.findExercisesByExerciseNameAndBodyPart(exercises);
      if (foundExercise.length < 1) {
        return exercises;
      }
      const existingMap = new Map(foundExercise.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      const newExercises = exercises.filter((ex) => !existingMap.has(ex.bodyPart + ex.exerciseName));
      return newExercises.map((exercise) => new FilteredExerciseDto(exercise));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error while finding new exercises: ${error.message}`);
      }
      throw new Error(`Unknown Error occurred while finding new exercises`);
    }
  }

  @Transactional()
  async bulkInsertExercises(saveExercisesRequest: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]> {
    const { exercises } = saveExercisesRequest;
    const foundExercises = await this.findExercisesByExerciseNameAndBodyPartLockMode(exercises);
    if (foundExercises.length > 0) {
      throw new ConflictException('Some or all exercises already exist. No new data was saved.');
    }
    const insertedExercises = await this.exerciseRepository.bulkInsertExercises(exercises);
    return insertedExercises.map((exercise) => new ExerciseDataResponseDto(exercise));
  }

  @Transactional()
  async bulkSoftDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    const { ids } = deleteExerciseRequestDto;
    const foundExercises = await this.exerciseRepository.findExercisesByIds(ids);
    if (ids.length !== foundExercises.length) {
      throw new BadRequestException(`Some exercises do not exist in the exercise entity.`);
    }
    await this.exerciseRepository.bulkSoftDelete(ids);
  }
}
