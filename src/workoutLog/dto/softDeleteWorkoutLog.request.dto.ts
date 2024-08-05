import { ArrayNotEmpty, IsArray, IsInt } from 'class-validator';

export class SoftDeleteWorkoutLogRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  ids: number[];
}
