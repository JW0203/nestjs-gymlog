import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, Matches } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class SaveRoutineFormatDto {
  @Matches(/^[a-zA-Z0-9\uAC00-\uD7A3\s]*$/)
  routineName: string;

  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;
}
