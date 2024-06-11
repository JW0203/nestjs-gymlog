import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLogToAbs } from '../../workoutLog/domain/WorkoutLogToAbs.entity';

@Entity()
export class Abs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToAbs, (workoutLogToAbs) => workoutLogToAbs.abs)
  public workoutLogToAbs: WorkoutLogToAbs[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
