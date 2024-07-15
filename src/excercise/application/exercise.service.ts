import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Transactional } from 'typeorm-transactional';
import { ExerciseDataArrayRequestDto } from '../dto/saveExerciseAll.request.dto';

@Injectable()
export class ExerciseService {
  private readonly logger = new Logger(ExerciseService.name);
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: ExerciseDataFormatDto) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async findAll(exercisesData: ExerciseDataFormatDto[]) {
    const exercises = exercisesData.map((exercise) => ({
      exerciseName: exercise.exerciseName,
      bodyPart: exercise.bodyPart,
    }));

    const foundExercises = await this.exerciseRepository.find({ where: exercises });
    if (!foundExercises) {
      this.logger.log(`can not find all exercises`);
      throw new NotFoundException(` Can not find all exercises`);
    }
    return foundExercises;
  }

  async findNewExercises(exerciseDataArray: ExerciseDataArrayRequestDto) {
    try {
      const exerciseData = exerciseDataArray.exercises;

      const foundExercise = await this.findAll(exerciseData);
      const existingMap = new Map(foundExercise.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      return exerciseData.filter((ex) => !existingMap.has(ex.bodyPart + ex.exerciseName));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error while finding new exercises: ${error.message}`);
      }
      throw new Error(`Unknown Error occurred while finding new exercises`);
    }
  }

  @Transactional()
  async bulkInsertExercises(exerciseDataArray: ExerciseDataArrayRequestDto) {
    try {
      const newExercises = await this.findNewExercises(exerciseDataArray);

      if (newExercises.length > 0) {
        const result = await this.exerciseRepository.insert(newExercises);
        const ids = result.identifiers.map((data) => data.id);
        const newData = await this.exerciseRepository.findBy({ id: In(ids) });
        if (!newData) {
          throw new NotFoundException('Something went wrong while creating new exercise!');
        }
        return newData;
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
      const result = await this.exerciseRepository.insert(saveExerciseRequestDto);
      const id = result.identifiers[0].id;
      const newData = await this.exerciseRepository.findOne({ where: { id } });
      if (!newData) {
        throw new NotFoundException('Something went wrong while creating new exercise!');
      }
      return newData;
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
