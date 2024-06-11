import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { RecordToChest } from './RecordToChest.entity';

@Entity()
export class Chest extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToChest, (recordToChest) => recordToChest.chest)
  public recordToChest: RecordToChest[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
