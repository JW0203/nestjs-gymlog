import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../excercise/domain/Exercise.entity';
import { IsInt, IsNotEmpty, Length, validateOrReject } from 'class-validator';

@Entity()
export class WorkoutLog extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsInt()
  @Length(1, 100)
  @Column()
  set: number;

  @IsNotEmpty()
  @IsInt()
  @Length(1, 1000)
  @Column()
  weight: number;

  @IsNotEmpty()
  @IsInt()
  @Length(1, 1000)
  @Column()
  repeat: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutLogs)
  public exercise: Exercise;

  @ManyToOne(() => User, (user) => user.workoutLogs)
  public user: User;

  constructor(params: { set: number; weight: number; repeat: number; exercise: Exercise; user: User }) {
    super();
    if (params) {
      this.set = params.set;
      this.weight = params.weight;
      this.repeat = params.repeat;
      this.exercise = params.exercise;
      this.user = params.user;
    }
    validateOrReject(this).catch((errors) => {
      console.log('(WorkoutLog entity validation failed). Errors: ', errors);
    });
  }
}
