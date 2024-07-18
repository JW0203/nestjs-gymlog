import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class UpdateWorkoutLogRequestDto {
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
  set: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  weight: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  repeat: number;
}
