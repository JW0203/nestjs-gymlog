import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateExerciseNameRequestDto {
  @IsNotEmpty()
  @IsString()
  originExerciseName: string;

  @IsNotEmpty()
  @IsString()
  newExerciseName: string;
}
