import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { ExerciseRepository } from '../domain/exercise.repository';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { LockConfigManager } from '../../common/infrastructure/typeormMysql.lock';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';

export class TypeOrmExerciseRepository implements ExerciseRepository {
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findOneByExerciseNameAndBodyPart(exerciseName: string, bodyPart: BodyPart): Promise<Exercise | null> {
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async findExercisesByExerciseNameAndBodyPart(
    exercisesData: ExerciseDataFormatDto[],
    lock?: boolean,
  ): Promise<Exercise[]> {
    if (lock) {
      const lockMode = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });
      return await this.exerciseRepository.find({ where: exercisesData, lock: lockMode });
    }
    return await this.exerciseRepository.find({ where: exercisesData });
  }

  async findAll(): Promise<Exercise[]> {
    return await this.exerciseRepository.find();
  }

  async findNewExercises(exerciseDataArray: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]> {
    try {
      const exerciseData = exerciseDataArray.exercises;
      const foundExercise = await this.findExercisesByExerciseNameAndBodyPart(exerciseData);
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

  async bulkInsertExercises(exerciseDataArray: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]> {
    const exerciseData = exerciseDataArray.exercises;
    const foundExercises = await this.findExercisesByExerciseNameAndBodyPart(exerciseData, true);
    if (foundExercises.length > 0) {
      throw new ConflictException('Some or all exercises already exist. No new data was saved.');
    }
    const insertedExercises = await this.exerciseRepository.insert(exerciseData);
    const exerciseIds = insertedExercises.identifiers.map((data) => data.id);
    const foundInsertedExercises = await this.exerciseRepository.find({ where: { id: In(exerciseIds) } });
    return foundInsertedExercises.map((exercise) => new ExerciseDataResponseDto(exercise));
  }

  async bulkSoftDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    const { ids } = deleteExerciseRequestDto;
    const foundExercises = await this.exerciseRepository.find({ where: { id: In(ids) } });
    if (ids.length !== foundExercises.length) {
      throw new BadRequestException(`Some exercises do not exist in the exercise entity.`);
    }
    await this.exerciseRepository.softDelete({ id: In(ids) });
  }
}
