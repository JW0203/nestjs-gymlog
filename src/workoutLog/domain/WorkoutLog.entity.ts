import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { BodyPart } from '../../excercise/domain/bodyPart.enum';

@Entity()
export class WorkoutLog extends Timestamps {
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
