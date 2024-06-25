import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './domain/Exercise.entity';
import { Module } from '@nestjs/common';
import { ExerciseService } from './application/exercise.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
  providers: [ExerciseService],
  exports: [ExerciseService],
})
export class ExerciseModule {}
