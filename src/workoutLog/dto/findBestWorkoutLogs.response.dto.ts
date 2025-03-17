import { BodyPart } from '../../common/bodyPart.enum';
import { IsDate, IsEnum, IsNotEmpty, IsNumber, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class BestWorkoutLog {
  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  userNickName: string;

  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(1000)
  maxWeight: number;

  @IsDate()
  achieveDate: Date;

  constructor(params: {
    exerciseName: string;
    bodyPart: BodyPart;
    maxWeight: number;
    achieveDate: Date;
    userNickName: string;
  }) {
    if (params) {
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
      this.maxWeight = params.maxWeight;
      this.userNickName = params.userNickName;
      this.achieveDate = params.achieveDate;
      this.userNickName = params.userNickName;
    }
  }
}
