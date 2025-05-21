import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { Logger } from '@nestjs/common';
import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';

@Entity()
export class RoutineExercise {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  routine: Routine;
  @Column()
  exercise: Exercise;
  @Column()
  order: number;

  update(params: { routine: Routine; exercise: Exercise; order: number }) {
    this.routine = params.routine;
    this.exercise = params.exercise;
    this.order = params.order;

    validateOrReject(this).catch((errors) => {
      const logger = new Logger('Routine Entity Update');
      logger.error('Validation failed during update.', errors);
      throw errors;
    });
  }
}
