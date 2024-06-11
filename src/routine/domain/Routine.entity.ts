import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class Routine extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @Column()
  exerciseName: string;

  constructor();
  constructor(params: { name: string; bodyPart: BodyPart; exerciseName: string });
  constructor(params?: { name: string; bodyPart: BodyPart; exerciseName: string }) {
    super();
    if (params) {
      this.name = params.name;
      this.bodyPart = params.bodyPart;
      this.exerciseName = params.exerciseName;
    }
  }
}
