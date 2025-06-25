import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateRoutine } from './updateRoutine.dto';

export class UpdateRoutinesRequestDto {
  @IsNumber()
  routineId: number;

  @IsString()
  routineName: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => UpdateRoutine)
  updateData: UpdateRoutine[];
}
