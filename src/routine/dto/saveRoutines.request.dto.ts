import { ValidateNested } from 'class-validator';
import { SaveRoutineFormatDto } from './saveRoutine.format.dto';
import { Type } from 'class-transformer';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class SaveRoutinesRequestDto {
  @ValidateNested()
  @Type(() => SaveRoutineFormatDto)
  routines: SaveRoutineFormatDto[];

  @ValidateNested({ each: true })
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];
}
