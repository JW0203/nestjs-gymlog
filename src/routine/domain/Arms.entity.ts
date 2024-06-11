import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RecordToArms } from './RecordToArms.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class Arms extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToArms, (recordToArms) => recordToArms.arms)
  public recordToArms: RecordToArms;

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
