import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Arms } from '../../excercise/domain/Arms.entity';
import { WorkoutLog } from './WorkoutLog.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class WorkoutLogToArms extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Arms, (arms) => arms.id)
  arms: Arms;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  constructor();
  constructor(params: { arms: Arms; workoutLog: WorkoutLog });
  constructor(params?: { arms: Arms; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.arms = params.arms;
      this.workoutLog = params.workoutLog;
    }
  }
}
