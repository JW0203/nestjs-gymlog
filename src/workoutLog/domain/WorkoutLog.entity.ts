import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Index, JoinColumn } from 'typeorm';
import { Timestamps } from '../../TimeStamp.entity';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  validateOrReject,
} from 'class-validator';
import { Logger } from '@nestjs/common';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { BodyPart } from '../../common/bodyPart.enum';

@Entity()
@Index('idx_user_id', ['user'])
@Index('idx_exercise_id', ['exercise'])
@Index('idx_exercise_weight_created', ['exercise', 'weight', 'createdAt'])
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
  @Min(0)
  @Max(1000)
  @Column()
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Column()
  repeatCount: number;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  @Column()
  userNickName: string;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @IsNotEmpty()
  @Column()
  @IsExerciseName()
  exerciseName: string;

  @ManyToOne(() => Exercise, (exercise) => exercise.workoutLogs)
  public exercise: Exercise;

  @ManyToOne(() => User, (user) => user.workoutLogs)
  @JoinColumn({ name: 'user_id' })
  public user: User;

  constructor(params: {
    id?: number;
    setCount: number;
    weight: number;
    repeatCount: number;
    exercise: Exercise;
    user: User;
    userNickName: string;
    bodyPart: BodyPart;
    exerciseName: string;
  }) {
    super();
    if (params) {
      this.setCount = params.setCount;
      this.weight = params.weight;
      this.repeatCount = params.repeatCount;
      this.exercise = params.exercise;
      this.user = params.user;
      this.bodyPart = params.bodyPart;
      this.userNickName = params.userNickName;
      this.exerciseName = params.exerciseName;

      validateOrReject(this).catch((errors) => {
        const logger = new Logger('WorkoutLog Entity');
        logger.log('(WorkoutLog entity validation failed). Errors: ', errors);
      });
    }
  }

  update(params: {
    setCount: number;
    weight: number;
    repeatCount: number;
    user: User;
    exercise: Exercise;
    userNickName: string;
    bodyPart: BodyPart;
    exerciseName: string;
  }) {
    this.setCount = params.setCount;
    this.weight = params.weight;
    this.repeatCount = params.repeatCount;
    this.exercise = params.exercise;
    this.user = params.user;
    this.userNickName = params.userNickName;
    this.bodyPart = params.bodyPart;
    this.exerciseName = params.exerciseName;

    validateOrReject(this).catch((errors) => {
      const logger = new Logger('WorkoutLog Entity Update');
      logger.error('Validation failed during update.', errors);
      throw errors;
    });
  }
}
