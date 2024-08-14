import { BodyPart } from '../../common/bodyPart.enum';
import { IsEnum, IsString } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';

export class SaveRoutineFormatDto {
  @IsString()
  routineName: string;

  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;
}
