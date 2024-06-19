import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineToExercise } from './domain/RoutineToExercise.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineToExercise])],
})
export class RoutineToExerciseModule {}
