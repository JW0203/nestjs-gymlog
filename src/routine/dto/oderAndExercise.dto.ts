import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { IsEnum, IsNumber } from 'class-validator';
import { BodyPart } from '../../common/bodyPart.enum';

export class OderAndExercise {
  @IsNumber()
  order: number;

  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;
}
