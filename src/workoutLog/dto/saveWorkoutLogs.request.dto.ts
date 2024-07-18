import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SaveWorkoutLogFormatDto } from './saveWorkoutLog.format.dto';

export class SaveWorkoutLogsRequestDto {
  @ValidateNested()
  @Type(() => ExerciseDataFormatDto)
  exercises: ExerciseDataFormatDto[];

  @ValidateNested()
  @Type(() => SaveWorkoutLogFormatDto)
  workoutLogs: SaveWorkoutLogFormatDto[];
}
