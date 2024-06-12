import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';

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

  @ManyToOne(() => User, (user) => user.routines)
  public user: User;

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
