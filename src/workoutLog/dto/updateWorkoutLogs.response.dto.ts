import { WorkoutLogResponseDto } from './workoutLog.response.dto';
import { validateOrReject } from 'class-validator';

export class UpdateWorkoutLogsResponseDto {
  queryResult: any;
  warnings: any;
  updatedResults: WorkoutLogResponseDto[];

  constructor(params: { queryResult: any; warnings: any; updatedResults: WorkoutLogResponseDto[] }) {
    if (params) {
      this.queryResult = params.queryResult;
      this.warnings = params.warnings;
      this.updatedResults = params.updatedResults;

      validateOrReject(this).catch((errors) => {
        console.log('(updateWorkoutLogsResponse validation failed) Errors:', errors);
      });
    }
  }
}
