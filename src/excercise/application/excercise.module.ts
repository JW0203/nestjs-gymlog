import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from '../domain/Exercise.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise])],
})
export class ExerciseModule {}
