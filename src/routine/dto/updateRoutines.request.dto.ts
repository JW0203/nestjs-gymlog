import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRoutine } from './updateRoutine.format.dto';

export class UpdateRoutinesRequestDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateRoutine)
  updateData: UpdateRoutine[];
}
