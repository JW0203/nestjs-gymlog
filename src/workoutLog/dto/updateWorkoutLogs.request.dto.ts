import { UpdateWorkoutLogFormatDto } from './updateWorkoutLog.format.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

export class UpdateWorkoutLogsRequestDto {
  @ValidateNested()
  @Type(() => UpdateWorkoutLogFormatDto)
  updateWorkoutLogs: UpdateWorkoutLogFormatDto[];

  @ValidateNested()
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];
}
