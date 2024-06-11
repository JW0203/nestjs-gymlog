import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shoulders } from '../../excercise/domain/Shoulders.entity';
import { WorkoutLog } from './WorkoutLog.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class WorkoutLogToShoulders extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shoulders, (shoulders) => shoulders.id)
  shoulders: Shoulders;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  constructor();
  constructor(params: { shoulders: Shoulders; workoutLog: WorkoutLog });
  constructor(params?: { shoulders: Shoulders; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.shoulders = params.shoulders;
      this.workoutLog = params.workoutLog;
    }
  }
}
