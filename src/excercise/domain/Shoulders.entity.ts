import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLogToShoulders } from '../../workoutLog/domain/WorkoutLogToShoulders.entity';

@Entity()
export class Shoulders extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToShoulders, (workoutLogToShoulders) => workoutLogToShoulders.shoulders)
  public workoutLogToShoulders: WorkoutLogToShoulders[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
