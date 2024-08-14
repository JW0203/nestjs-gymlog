import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Exercise } from '../domain/Exercise.entity';
import { In } from 'typeorm';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Transactional } from 'typeorm-transactional';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';
import { ExerciseRepository } from '../domain/exercise.repository';
import { EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { GetExercisesRequestDto } from '../dto/getExercises.request.dto';

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
      return foundExercise;
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

  async findExercisesByExerciseNameAndBodyPart(getExercisesRequest: GetExercisesRequestDto): Promise<Exercise[]> {
    return await this.exerciseRepository.findExercisesByExerciseNameAndBodyPart(getExercisesRequest);
  }

  async findNewExercises(exerciseDataArray: SaveExercisesRequestDto) {
    return this.exerciseRepository.findNewExercises(exerciseDataArray);
  }

  @Transactional()
  async bulkInsertExercises(exerciseDataArray: SaveExercisesRequestDto): Promise<ExerciseDataResponseDto[]> {
    return this.exerciseRepository.bulkInsertExercises(exerciseDataArray);
  }

  @Transactional()
  async bulkSoftDelete(deleteExerciseRequestDto: DeleteExerciseRequestDto) {
    await this.exerciseRepository.bulkSoftDelete(deleteExerciseRequestDto);
  }
}
