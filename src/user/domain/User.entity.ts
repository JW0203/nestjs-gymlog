import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { IsNotEmpty, Matches, MaxLength, MinLength, validateOrReject } from 'class-validator';
import { NoWhitespace } from '../../common/validation/NoWhitespace.validation';

@Entity()
@Index('idx_user_deleted', ['deletedAt', 'id'])
export class User extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  email: string;

  @IsNotEmpty()
  @NoWhitespace()
  @MinLength(8)
  @MaxLength(1000)
  @Column()
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  @Column()
  nickName: string;

  @OneToMany(() => WorkoutLog, (workoutLog) => workoutLog.user)
  public workoutLogs: WorkoutLog[];

  @OneToMany(() => Routine, (routine) => routine.user)
  public routines: Routine[];

  constructor(params: { email: string; password: string; nickName: string }) {
    super();
    if (params) {
      this.email = params.email;
      this.password = params.password;
      this.nickName = params.nickName;

      validateOrReject(this).catch((errors) => {
        console.log(`Errors while make new user entity`, errors);
      });
    }
  }
}
