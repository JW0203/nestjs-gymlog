import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLogToExercise } from './domain/WorkoutLogToExercise.entity';
import { WorkoutLogToExerciseService } from './application/workoutLogToExercise.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLogToExercise])],
  providers: [WorkoutLogToExerciseService],
  exports: [WorkoutLogToExerciseService],
})
export class WorkoutLogToExerciseModule {}
