import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exercise } from '../../excercise/domain/Exercise.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class RoutineToExercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Routine, (routine) => routine.routineToExercises)
  public routine: Routine;

  @ManyToOne(() => Exercise, (exercise) => exercise.routineToExercises)
  public exercise: Exercise;
}
