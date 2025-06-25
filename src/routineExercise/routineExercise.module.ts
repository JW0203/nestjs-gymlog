import { forwardRef, Module } from '@nestjs/common';
import { RoutineExerciseService } from './application/routineExercise.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseModule } from '../exercise/excercise.module';
import { LoggerModule } from '../common/Logger/logger.module';
import { RoutineExercise } from './domain/RoutineExercise.entity';
import { ROUTINE_EXERCISE_REPOSITORY } from '../common/const/inject.constant';
import { TypeOrmRoutineExerciseRepository } from './infrastructure/typeormRoutineExercise.repository';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineExercise]), forwardRef(() => ExerciseModule), LoggerModule],
  providers: [
    RoutineExerciseService,
    { provide: ROUTINE_EXERCISE_REPOSITORY, useClass: TypeOrmRoutineExerciseRepository },
  ],
  exports: [RoutineExerciseService],
})
export class RoutineExerciseModule {}
