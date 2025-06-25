import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { IsNumber, validateOrReject } from 'class-validator';
import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class RoutineExercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNumber()
  @Column()
  order: number;

  @ManyToOne(() => Routine, (routine) => routine.routineExercise)
  routine: Routine;

  @ManyToOne(() => Exercise, (exercise) => exercise.routineExercise)
  exercise: Exercise;

  constructor(params: { routine: Routine; exercise: Exercise; order: number }) {
    super();
    if (params) {
      this.routine = params.routine;
      this.exercise = params.exercise;
      this.order = params.order;

      validateOrReject(this).catch((errors) => {
        console.log('(RoutineExercise entity validation failed). Errors: ', errors);
      });
    }
  }
}
