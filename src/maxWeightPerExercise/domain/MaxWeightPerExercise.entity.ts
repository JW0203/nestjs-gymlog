import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  IsDate,
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
import { BodyPart } from '../../common/bodyPart.enum';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { Timestamps } from '../../TimeStamp.entity';
import { Logger } from '@nestjs/common';

@Entity()
export class MaxWeightPerExercise extends Timestamps {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  @Column()
  userNickName: string;

  @IsNotEmpty()
  @Column()
  @IsExerciseName()
  exerciseName: string;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  @Column({ type: 'enum', enum: BodyPart })
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @Column()
  maxWeight: number;

  @IsDate()
  @Column()
  achieveDate: Date;

  constructor(params: {
    id?: number;
    exerciseName: string;
    bodyPart: BodyPart;
    maxWeight: number;
    userNickName: string;
    achieveDate: Date;
  }) {
    super();
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
      this.maxWeight = params.maxWeight;
      this.userNickName = params.userNickName;
      this.achieveDate = params.achieveDate;

      validateOrReject(this).catch((errors) => {
        const logger = new Logger('WorkoutLog Entity');
        logger.log('(WorkoutLog entity validation failed). Errors: ', errors);
      });
    }
  }
}
