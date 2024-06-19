import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { BodyPart } from './bodyPart.enum';
import { WorkoutLogToExercise } from '../../workoutLogToExercise/domain/WorkoutLogToExercise.entity';
import { RoutineToExercise } from '../../routineToExercise/domain/RoutineToExercise.entity';

@Entity()
export class Exercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToExercise, (workoutLogToExercise) => workoutLogToExercise.exercise)
  workoutLogToExercises: WorkoutLogToExercise[];

  @OneToMany(() => RoutineToExercise, (routineToExercise) => routineToExercise.exercise)
  routineToExercises: RoutineToExercise[];

  constructor();
  constructor(params: { bodyPart: BodyPart; exerciseName: string });
  constructor(params?: { bodyPart: BodyPart; exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
    }
  }
}
