import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLogToExercise } from '../domain/WorkoutLogToExercise.entity';
import { SaveWorkoutLogToExerciseRequestDto } from '../dto/saveWorkoutLogToExercise.request.dto';

@Injectable()
export class WorkoutLogToExerciseService {
  constructor(
    @InjectRepository(WorkoutLogToExercise)
    private readonly workoutLogToExerciseRepository: Repository<WorkoutLogToExercise>,
  ) {}

  async saveWorkoutLogToExercise(saveWorkoutLogToExerciseRequestDto: SaveWorkoutLogToExerciseRequestDto) {
    return await this.workoutLogToExerciseRepository.save(saveWorkoutLogToExerciseRequestDto);
  }
}
