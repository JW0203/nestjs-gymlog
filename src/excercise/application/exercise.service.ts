import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';

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

  async findNewExercises(exerciseDataArray: SaveExercisesRequestDto) {
    try {
      const exerciseData = exerciseDataArray.exercises;

      const foundExercise = await this.findAll(exerciseData);
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

  @Transactional()
  async bulkInsertExercises(exerciseDataArray: SaveExercisesRequestDto) {
    try {
      const exerciseData = exerciseDataArray.exercises;
      const exercises = exerciseData.map(
        (exercise) =>
          new Exercise({
            exerciseName: exercise.exerciseName,
            bodyPart: exercise.bodyPart,
          }),
      );
      const result = await this.exerciseRepository.insert(exercises);
      const ids = result.identifiers.map((data) => data.id);
      const newData = await this.exerciseRepository.findBy({ id: In(ids) });
      if (!newData) {
        throw new NotFoundException('Something went wrong while creating new exercise!');
      }
      return newData.map((exercise) => new ExerciseDataResponseDto(exercise));
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

  async softDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    const { ids } = deleteExerciseRequestDto;
    const foundExercises = await this.exerciseRepository.find({ where: { id: In(ids) } });
    if (ids.length === foundExercises.length) {
      throw new BadRequestException(`Some exercises do not exist in the exercise entity.`);
    }
    await this.exerciseRepository.softDelete(ids);
  }
}
