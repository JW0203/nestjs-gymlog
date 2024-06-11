import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { RecordToLegs } from './RecordToLeg.entity';

@Entity()
export class Legs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToLegs, (recordToLegs) => recordToLegs.legs)
  public recordToLegs: RecordToLegs[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
