import { BodyPart } from '../../common/bodyPart.enum';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BestWorkoutLog {
  @IsNotEmpty()
  @IsString()
  exerciseName: string;
  @IsNotEmpty()
  @IsString()
  userEmail: string;
  @IsNotEmpty()
  bodyPart: BodyPart;
  @IsNotEmpty()
  @IsNumber()
  weight: number;
}
