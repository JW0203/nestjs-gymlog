import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

@Entity()
export class User extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @OneToMany(() => WorkoutLog, (workoutLog) => workoutLog.id)
  public workoutLog: WorkoutLog[];

  constructor(params: { email: string; password: string; name: string }) {
    super();
    if (params) {
      this.email = params.email;
      this.password = params.password;
      this.name = params.name;
    }
  }
}
