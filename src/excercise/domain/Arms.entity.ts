import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutLogToArms } from '../../workoutLog/domain/WorkoutLogToArms.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class Arms extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToArms, (workoutLogToArms) => workoutLogToArms.arms)
  public workoutLogToArms: WorkoutLogToArms;

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
