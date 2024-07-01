import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { BodyPart } from './bodyPart.enum';
import { RoutineToExercise } from '../../routineToExercise/domain/RoutineToExercise.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

@Entity()
export class Exercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLog, (workoutLog) => workoutLog.exercise)
  workoutLogs: WorkoutLog[];

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
