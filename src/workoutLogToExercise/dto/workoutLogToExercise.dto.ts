import { Exercise } from '../../excercise/domain/Exercise.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

export class WorkoutLogToExerciseDto {
  exercise: Exercise;
  workoutLog: WorkoutLog;
}
