import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './domain/Exercise.entity';
import { Module } from '@nestjs/common';
import { ExerciseService } from './application/exercise.service';
import { ExerciseController } from './presentation/exercise.controller';
import { LoggerModule } from '../common/Logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, LoggerModule])],
  providers: [ExerciseService],
  controllers: [ExerciseController],
  exports: [ExerciseService],
})
export class ExerciseModule {}
