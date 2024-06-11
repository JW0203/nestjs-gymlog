import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { UserToBack } from './RecordToBack.entity';

@Entity()
export class Back extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => UserToBack, (userToBack) => userToBack.back)
  public userToBack: UserToBack[];
}
