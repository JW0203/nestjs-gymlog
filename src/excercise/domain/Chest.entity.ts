import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLogToChest } from '../../workoutLog/domain/WorkoutLogToChest.entity';

@Entity()
export class Chest extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => WorkoutLogToChest, (workoutLogToChest) => workoutLogToChest.chest)
  public workoutLogToChest: WorkoutLogToChest[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
