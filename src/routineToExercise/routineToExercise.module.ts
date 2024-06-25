import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutineToExercise } from './domain/RoutineToExercise.entity';
import { Module } from '@nestjs/common';
import { RoutineToExerciseService } from './application/routineToExercise.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineToExercise])],
  providers: [RoutineToExerciseService],
  exports: [RoutineToExerciseService],
})
export class RoutineToExerciseModule {}
