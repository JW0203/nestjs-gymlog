import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { Legs } from '../../excercise/domain/Legs.entity';
import { WorkoutLog } from './WorkoutLog.entity';

@Entity()
export class WorkoutLogToLegs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Legs, (legs) => legs.id)
  legs: Legs;
  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  constructor();
  constructor(params: { legs: Legs; workoutLog: WorkoutLog });
  constructor(params?: { legs: Legs; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.legs = params.legs;
      this.workoutLog = params.workoutLog;
    }
  }
}
