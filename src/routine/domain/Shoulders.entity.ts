import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { RecordToShouldersEntity } from './RecordToShoulders.entity';

@Entity()
export class Shoulders extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => RecordToShouldersEntity, (recordToShoulders) => recordToShoulders.shoulders)
  public recordToShouldersEntity: RecordToShouldersEntity[];
}
