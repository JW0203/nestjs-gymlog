import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkoutLogToExercise } from '../domain/WorkoutLogToExercise.entity';
import { SaveWorkoutLogToExerciseRequestDto } from '../dto/saveWorkoutLogToExercise.request.dto';
import { UpdateWorkoutLogToExerciseRequestDto } from '../dto/updateWorkoutLogToExercise.request.dto';

@Injectable()
export class WorkoutLogToExerciseService {
  private readonly logger = new Logger(WorkoutLogToExerciseService.name);
  constructor(
    @InjectRepository(WorkoutLogToExercise)
    private readonly workoutLogToExerciseRepository: Repository<WorkoutLogToExercise>,
  ) {}

  async saveWorkoutLogToExercise(saveWorkoutLogToExerciseRequestDto: SaveWorkoutLogToExerciseRequestDto) {
    return await this.workoutLogToExerciseRepository.save(saveWorkoutLogToExerciseRequestDto);
  }

  async updateWorkoutLogToExercise(
    id: number,
    updateWorkoutLogToExerciseRequestDto: UpdateWorkoutLogToExerciseRequestDto,
  ) {
    this.logger.error(`Database update starts`);
    const updated = await this.workoutLogToExerciseRepository.update(id, updateWorkoutLogToExerciseRequestDto);
    return updated.affected ? 'updated' : false;
  }

  async deleteWorkoutLogToExercise(workoutId: number) {
    return this.workoutLogToExerciseRepository.softDelete(workoutId);
  }
}
