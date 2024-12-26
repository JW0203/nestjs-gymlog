import { UpdateWorkoutLogFormatDto } from './updateWorkoutLog.format.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateWorkoutLogsRequestDto {
  @ValidateNested()
  @Type(() => UpdateWorkoutLogFormatDto)
  updateWorkoutLogs: UpdateWorkoutLogFormatDto[];
}
