import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class SaveWorkoutLogRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsInt()
  @Min(1)
  set: number;

  @IsInt()
  @Min(1)
  weight: number;

  @IsInt()
  @Min(1)
  repeat: number;
}
