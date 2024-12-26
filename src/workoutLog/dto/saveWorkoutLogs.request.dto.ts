import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SaveWorkoutLogFormatDto } from './saveWorkoutLog.format.dto';

export class SaveWorkoutLogsRequestDto {
  @ValidateNested()
  @Type(() => SaveWorkoutLogFormatDto)
  workoutLogs: SaveWorkoutLogFormatDto[];
}
