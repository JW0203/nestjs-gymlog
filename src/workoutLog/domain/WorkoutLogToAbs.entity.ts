import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Abs } from '../../excercise/domain/Abs.entity';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from './WorkoutLog.entity';

@Entity()
export class WorkoutLogToAbs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Abs, (abs) => abs.id)
  abs: Abs;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  constructor();
  constructor(params: { abs: Abs; workoutLog: WorkoutLog });
  constructor(params?: { abs: Abs; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.abs = params.abs;
      this.workoutLog = params.workoutLog;
    }
  }
}
