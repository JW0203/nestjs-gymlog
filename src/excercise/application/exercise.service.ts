import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { In, Repository } from 'typeorm';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Transactional } from 'typeorm-transactional';
import { ExerciseDataArrayRequestDto } from '../dto/saveExercises.request.dto';

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
    // ToDo: dto 적용
    return foundExercises;
  }

  async findNewExercises(exerciseDataArray: ExerciseDataArrayRequestDto) {
    try {
      const exerciseData = exerciseDataArray.exercises;

      const foundExercise = await this.findAll(exerciseData);
      const existingMap = new Map(foundExercise.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      // ToDo: dto 적용
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
      const exerciseData = exerciseDataArray.exercises;
      // ToDo: dto 에 있는 데이터 말고  new Exercise 이용할 것
      const result = await this.exerciseRepository.insert(exerciseData);
      const ids = result.identifiers.map((data) => data.id);
      const newData = await this.exerciseRepository.findBy({ id: In(ids) });
      if (!newData) {
        throw new NotFoundException('Something went wrong while creating new exercise!');
      }
      // ToDo: dto 적용
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

  // ToDo: 필요 없는 메소드
  async saveExercise(saveExerciseRequestDto: SaveExerciseRequestDto): Promise<Exercise> {
    const { exerciseName, bodyPart } = saveExerciseRequestDto;
    const exercise = await this.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
    if (exercise) {
      throw new ConflictException('Exercise already exists');
    }

    try {
      const newExercise = new Exercise({ exerciseName, bodyPart });
      return await this.exerciseRepository.save(newExercise);
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

  // ToDo: dto 적용 , bulk delete 적용
  async softDelete(id: number) {
    return await this.exerciseRepository.softDelete(id);
  }
}
