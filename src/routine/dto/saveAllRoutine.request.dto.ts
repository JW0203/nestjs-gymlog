import { ValidateNested } from 'class-validator';
import { SaveRoutineRequestDto } from './saveRoutine.request.dto';
import { Type } from 'class-transformer';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class SaveAllRoutineRequestDto {
  @ValidateNested()
  @Type(() => SaveRoutineRequestDto)
  routines: SaveRoutineRequestDto[];

  @ValidateNested({ each: true })
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];
}
