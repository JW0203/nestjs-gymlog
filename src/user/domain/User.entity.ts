import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { IsNotEmpty, Matches, MaxLength, MinLength, validateOrReject } from 'class-validator';
import { NoWhitespace } from '../../common/validation/NoWhitespace.validation';

@Entity()
export class User extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  email: string;

  @IsNotEmpty()
  @NoWhitespace()
  @MinLength(8)
  @MaxLength(15)
  @Column()
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[A-Za-z0-9]+$/)
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

      validateOrReject(this).catch((errors) => {
        console.log(`Errors while make new user entity`, errors);
      });
    }
  }
}
