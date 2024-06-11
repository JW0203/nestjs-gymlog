import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BodyPart } from '../../excercise/domain/bodyPart.enum';

@Entity()
export class Routine {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: string;

  @Column()
  excersiseName: string;
}
