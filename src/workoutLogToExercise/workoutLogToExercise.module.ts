import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLogToExercise } from './domain/WorkoutLogToExercise.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLogToExercise])],
})
export class WorkoutLogToExerciseModule {}
