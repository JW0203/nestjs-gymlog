import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutLog } from './WorkoutLog.entity';
import { Back } from '../../excercise/domain/Back.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class WorkoutLogToBack extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  @ManyToOne(() => Back, (back) => back.id)
  back: Back;

  constructor();
  constructor(params: { back: Back; workoutLog: WorkoutLog });
  constructor(params?: { back: Back; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.back = params.back;
      this.workoutLog = params.workoutLog;
    }
  }
}
