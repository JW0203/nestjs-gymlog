import { IsNumber, IsString } from 'class-validator';

export class FindWorkoutLogsByYearResponseDto {
  @IsString()
  exercise_name: string;
  @IsString()
  exercise_count: string;
  @IsNumber()
  max_weight: number;
  @IsNumber()
  year: number;
}
