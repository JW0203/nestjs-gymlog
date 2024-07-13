import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsExerciseName } from '../validation/IsExerciseName.validation';
import { BodyParts } from '../validation/bodyPart.validation';

export class ExerciseDataRequestDto {
  @IsNotEmpty()
  @IsEnum(BodyParts)
  bodyPart: BodyParts;

  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;
}
