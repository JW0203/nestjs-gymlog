import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { IsEnum, IsInt, Min } from 'class-validator';

export class SaveWorkoutLogRequestDto {
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
