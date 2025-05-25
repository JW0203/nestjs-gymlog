import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { IsExerciseName } from '../../common/validation/isExerciseName.validation';
import { BodyPart } from '../../common/bodyPart.enum';

export class UpdateRoutine {
  @IsNumber()
  order: number;

  @IsOptional()
  @IsNumber()
  exerciseId?: number;

  @IsExerciseName()
  exerciseName: string;

  @IsEnum(BodyPart)
  bodyPart: BodyPart;
}
