import { SaveExerciseRequestDto } from './saveExercise.request.dto';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

export class ExerciseDataArrayRequestDto {
  @ValidateNested({ each: true })
  @Type(() => SaveExerciseRequestDto)
  exercises: SaveExerciseRequestDto[];
}
