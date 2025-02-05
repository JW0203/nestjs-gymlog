import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { BodyPart } from '../../common/bodyPart.enum';

export class FindWorkoutLogsByYearMonthResponseDto {
  @IsNotEmpty()
  body_part: BodyPart;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  max_weight: number;

  @IsString()
  @IsNotEmpty()
  exercise_count: string;

  @IsNumber()
  @IsNotEmpty()
  year: number;

  @IsNumber()
  @IsNotEmpty()
  month: number;
}
