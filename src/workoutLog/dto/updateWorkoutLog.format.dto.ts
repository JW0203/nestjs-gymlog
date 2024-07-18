import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class UpdateWorkoutLogFormatDto {
  @IsNotEmpty()
  @IsString()
  @IsExerciseName()
  exerciseName: string;

  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(100)
  setCount: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(1000)
  weight: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  repeatCount: number;
}
