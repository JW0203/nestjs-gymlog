import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class SaveWorkoutLogFormatDto {
  @IsNotEmpty()
  @IsString()
  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsInt()
  @Min(1)
  setCount: number;

  @IsInt()
  @Min(1)
  weight: number;

  @IsInt()
  @Min(1)
  repeatCount: number;
}
