import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../excercise/domain/Exercise.entity';
import { IsNotEmpty } from 'class-validator';

@Entity()
export class WorkoutLog extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @Column()
  set: number;

  @IsNotEmpty()
  @Column()
  weight: number;

  @IsNotEmpty()
  @Column()
  repeat: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutLogs)
  public exercise: Exercise;

  @ManyToOne(() => User, (user) => user.workoutLogs)
  public user: User;

  constructor(params: { set: number; weight: number; repeat: number; exercise?: Exercise; user?: User }) {
    super();
    if (params) {
      this.set = params.set;
      this.weight = params.weight;
      this.repeat = params.repeat;
      if (params.exercise) {
        this.exercise = params.exercise;
      }
      if (params.user) {
        this.user = params.user;
      }
    }
  }
}
