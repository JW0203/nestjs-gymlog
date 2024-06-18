import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class User extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  email: string;

  @IsNotEmpty()
  @Column()
  password: string;

  @IsNotEmpty()
  @Column()
  name: string;

  @OneToMany(() => WorkoutLog, (workoutLog) => workoutLog.user)
  public workoutLogs: WorkoutLog[];

  @OneToMany(() => Routine, (routine) => routine.user)
  public routines: Routine[];

  constructor(params: { email: string; password: string; name: string }) {
    super();
    if (params) {
      this.email = params.email;
      this.password = params.password;
      this.name = params.name;
    }
  }
}
