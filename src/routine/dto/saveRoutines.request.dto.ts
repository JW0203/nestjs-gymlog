import { IsNotEmpty, ValidateNested } from 'class-validator';
import { SaveRoutineFormatDto } from './saveRoutine.format.dto';
import { Type } from 'class-transformer';

export class SaveRoutinesRequestDto {
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SaveRoutineFormatDto)
  routines: SaveRoutineFormatDto[];
}
