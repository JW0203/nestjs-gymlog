import { IsEnum, IsInt, IsString } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { BodyPart } from '../../common/bodyPart.enum';

export class UpdateRoutine {
  @IsInt()
  id: number;

  @IsString()
  routineName: string;

  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;
}
