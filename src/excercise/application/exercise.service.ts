import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { Repository } from 'typeorm';
import { FindByExerciseNameAndBodyPart } from '../dto/findByExerciseNameAndBodyPart.request.dto';
import { SaveExerciseRequestDto } from '../dto/saveExercise.request.dto';

@Injectable()
export class ExerciseService {
  constructor(@InjectRepository(Exercise) private exerciseRepository: Repository<Exercise>) {}

  async findByExerciseNameAndBodyPart(findByExerciseNameAndBodyPart: FindByExerciseNameAndBodyPart) {
    const { exerciseName, bodyPart } = findByExerciseNameAndBodyPart;
    return await this.exerciseRepository.findOne({ where: { exerciseName, bodyPart } });
  }

  async saveExercise(saveExerciseRequestDto: SaveExerciseRequestDto): Promise<Exercise> {
    const { exerciseName, bodyPart } = saveExerciseRequestDto;
    const exercise = await this.findByExerciseNameAndBodyPart({ exerciseName, bodyPart });
    if (!exercise) {
      return await this.exerciseRepository.save(saveExerciseRequestDto);
    }
    return exercise;
  }

  async findExerciseByRoutineIds(routineIds: number[]): Promise<Exercise[]> {
    return await this.exerciseRepository
      .createQueryBuilder('exercise')
      .innerJoin('exercise.routineToExercises', 'routineToExercises')
      .innerJoin('routineToExercises.routine', 'routine')
      .where('routine.id IN (:...routineIds)', { routineIds }) // 여러 ID 처리
      .getMany();
  }
}
