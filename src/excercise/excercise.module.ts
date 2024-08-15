import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './domain/Exercise.entity';
import { Module } from '@nestjs/common';
import { ExerciseService } from './application/exercise.service';
import { ExerciseController } from './presentation/exercise.controller';
import { LoggerModule } from '../common/Logger/logger.module';
import { EXERCISE_REPOSITORY } from '../common/const/inject.constant';
import { TypeOrmExerciseRepository } from './infrastructure/typeormExercise.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, LoggerModule])],
  providers: [ExerciseService, { provide: EXERCISE_REPOSITORY, useClass: TypeOrmExerciseRepository }],
  controllers: [ExerciseController],
  exports: [ExerciseService],
})
export class ExerciseModule {}
