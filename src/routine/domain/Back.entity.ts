import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { RecordToBack } from './RecordToBack.entity';

@Entity()
export class Back extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToBack, (recordToBack) => recordToBack.back)
  public recordToBack: RecordToBack[];
}
