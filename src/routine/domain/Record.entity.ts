import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { BodyPart } from './bodyPart.enum';

@Entity()
export class Record extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: string;

  @Column()
  set: number;

  @Column()
  weight: number;

  @Column()
  repeat: number;
}
