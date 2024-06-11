import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserToArms } from './RecordToArms.entity';
import { Timestamps } from '../../TimeStamp.entity';

@Entity()
export class Arms extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exerciseName: string;

  @OneToMany(() => UserToArms, (userToArms) => userToArms.arms)
  public userToArms: UserToArms;

  constructor();
  constructor(params: { exerciseName: string });
  constructor(params?: { exerciseName: string }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
    }
  }
}
