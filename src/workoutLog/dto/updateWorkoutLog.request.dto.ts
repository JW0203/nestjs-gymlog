import { BodyPart } from '../../excercise/domain/bodyPart.enum';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

export class UpdateWorkoutLogRequestDto {
  exerciseName: string;

  @IsInt()
  @IsNotEmpty()
  id: number;

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
