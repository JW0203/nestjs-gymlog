import { IsEnum, IsNotEmpty } from 'class-validator';
import { IsExerciseName } from '../validation/isExerciseName.validation';
import { BodyPart } from '../bodyPart.enum';

export class ExerciseDataFormatDto {
  @IsNotEmpty()
  @IsEnum(BodyPart)
  bodyPart: BodyPart;

  @IsNotEmpty()
  @IsExerciseName()
  exerciseName: string;
}
