import { IsArray, IsInt } from 'class-validator';

export class DeleteExerciseRequestDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[];
}
