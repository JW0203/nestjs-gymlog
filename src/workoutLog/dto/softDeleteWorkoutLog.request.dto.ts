import { ArrayNotEmpty, IsArray, IsNumber } from 'class-validator';

export class SoftDeleteWorkoutLogRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  ids: number[];
}
