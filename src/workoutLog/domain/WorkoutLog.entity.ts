import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../excercise/domain/Exercise.entity';
import { IsNotEmpty, IsNumber, Max, Min, validate, validateOrReject } from 'class-validator';
import { Logger } from '@nestjs/common';

@Entity()
export class WorkoutLog extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Column()
  setCount: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Column()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Column()
  repeatCount: number;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutLogs)
  public exercise: Exercise;

  @ManyToOne(() => User, (user) => user.workoutLogs)
  public user: User;

  constructor(params: { setCount: number; weight: number; repeatCount: number; exercise: Exercise; user: User }) {
    super();
    if (params) {
      this.setCount = params.setCount;
      this.weight = params.weight;
      this.repeatCount = params.repeatCount;
      this.exercise = params.exercise;
      this.user = params.user;
    }
    validateOrReject(this).catch((errors) => {
      const logger = new Logger('WorkoutLog Entity');
      logger.log('(WorkoutLog entity validation failed). Errors: ', errors);
    });
  }
}
