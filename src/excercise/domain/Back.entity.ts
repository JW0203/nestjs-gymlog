import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLogToBack } from '../../workoutLog/domain/WorkoutLogToBack.entity';

@Entity()
export class Back extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToBack, (workoutLogToBack) => workoutLogToBack.back)
  public workoutLogToBack: WorkoutLogToBack[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
