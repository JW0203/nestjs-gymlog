import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { Chest } from '../../excercise/domain/Chest.entity';
import { WorkoutLog } from './WorkoutLog.entity';

@Entity()
export class WorkoutLogToChest extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkoutLog, (workoutLog) => workoutLog.id)
  workoutLog: WorkoutLog;

  @ManyToOne(() => Chest, (chest) => chest.id)
  chest: Chest;

  constructor();
  constructor(params: { chest: Chest; workoutLog: WorkoutLog });
  constructor(params?: { chest: Chest; workoutLog: WorkoutLog }) {
    super();
    if (params) {
      this.chest = params.chest;
      this.workoutLog = params.workoutLog;
    }
  }
}
