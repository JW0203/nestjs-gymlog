import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { UserToLegs } from './RecordToLeg.entity';

@Entity()
export class Legs extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => UserToLegs, (userToLegs) => userToLegs.legs)
  public userToLegs: UserToLegs[];

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
