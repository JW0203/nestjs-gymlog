import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { FindByExerciseNameAndBodyPart } from '../dto/findByExerciseNameAndBodyPart.request.dto';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';
import { BodyPart } from '../domain/bodyPart.enum';
import { ExerciseDataRequestDto } from '../../workoutLog/dto/exerciseData.request.dto';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class ExerciseService {
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: FindByExerciseNameAndBodyPart) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async findAll(exercisesData: ExerciseDataRequestDto[]) {
    const exercises = exercisesData.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      bodyPart: exercise.bodyPart,
    }));
    return await this.exerciseRepository.find({ where: exercises });
  }

  async findNewExercise(exercisesData: ExerciseDataRequestDto[]) {
    try {
      const foundExercise = await this.findAll(exercisesData);
      const existingMap = new Map(foundExercise.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      return exercisesData.filter((ex) => !existingMap.has(ex.bodyPart + ex.exerciseName));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error while finding new exercises: ${error.message}`);
      }
      throw new Error(`Unknown Error occurred while finding new exercises`);
    }
  }

  @Transactional()
  async bulkInsertExercises(exercisesData: ExerciseDataRequestDto[]) {
    try {
      const newExercises = await this.findNewExercise(exercisesData);
      if (newExercises.length > 0) {
        await this.exerciseRepository.insert(newExercises);
        return this.findAll(newExercises);
      }
      return 'All exercises are already saved';
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('[Duplicate entry] Exercise already exists');
        }
        throw new Error(`Error while saving exercise: ${error.message}`);
      }
      throw new Error('unknown Error occurred while saving exercise');
    }
  }

  async saveExercise(saveExerciseRequestDto: SaveExerciseRequestDto): Promise<Exercise> {
    const { exerciseName, bodyPart } = saveExerciseRequestDto;
    const exercise = await this.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
    if (exercise) {
      throw new ConflictException('Exercise already exists');
    }

    try {
      await this.exerciseRepository.insert(saveExerciseRequestDto);
      const savedExercise = await this.findByExerciseNameAndBodyPart(saveExerciseRequestDto);
      if (!savedExercise) {
        throw new NotFoundException('savedExercise can not find by requested data');
      }
      return savedExercise;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Duplicate entry')) {
          throw new ConflictException('[Duplicate entry] Exercise already exists');
        }
        throw new Error(`Error while saving exercise: ${error.message}`);
      }
      throw new Error('unknown Error occurred while saving exercise');
    }
  }

  async softDelete(id: number) {
    return await this.exerciseRepository.softDelete(id);
  }
}
