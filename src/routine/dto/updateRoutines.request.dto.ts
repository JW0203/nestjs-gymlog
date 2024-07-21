import { IsString, ValidateNested } from 'class-validator';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { Type } from 'class-transformer';
import { UpdateRoutine } from './updateRoutine.format.dto';

export class UpdateRoutinesRequestDto {
  @IsString()
  routineName: string;

  @ValidateNested()
  @Type(() => UpdateRoutine)
  updateData: UpdateRoutine[];

  @ValidateNested()
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];
}
