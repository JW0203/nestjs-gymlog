import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLogToExercise } from '../../workoutLogToExercise/domain/WorkoutLogToExercise.entity';
import { User } from '../../user/domain/User.entity';

@Entity()
export class WorkoutLog extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  set: number;

  @Column()
  weight: number;

  @Column()
  repeat: number;

  @OneToMany(() => WorkoutLogToExercise, (workoutLogToExercise) => workoutLogToExercise.workoutLog)
  public workoutLogToExercises: WorkoutLogToExercise[];

  @ManyToOne(() => User, (user) => user.workoutLogs)
  public user: User;

  constructor();
  constructor(params: { set: number; weight: number; repeat: number });
  constructor(params?: { set: number; weight: number; repeat: number }) {
    super();
    if (params) {
      this.set = params.set;
      this.weight = params.weight;
      this.repeat = params.repeat;
    }
  }
}
