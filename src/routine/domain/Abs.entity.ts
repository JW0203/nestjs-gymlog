import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { RecordToAbs } from './RecordToAbs.entity';

@Entity()
export class Abs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToAbs, (recordToAbs) => recordToAbs.abs)
  public recordToAbs: RecordToAbs[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
