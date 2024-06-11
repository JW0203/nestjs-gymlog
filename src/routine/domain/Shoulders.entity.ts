import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { UserToShoulders } from './RoutineToShoulders.entity';

@Entity()
export class Shoulders extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => UserToShoulders, (userToShoulders) => userToShoulders.shoulders)
  public userToShoulders: UserToShoulders[];
}
