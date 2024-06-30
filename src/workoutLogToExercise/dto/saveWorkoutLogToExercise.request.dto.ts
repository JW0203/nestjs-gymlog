import { Exercise } from '../../excercise/domain/Exercise.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';

export class SaveWorkoutLogToExerciseRequestDto {
  exercise: Exercise;
  workoutLog: WorkoutLog;
}
