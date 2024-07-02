import { WorkoutLog } from '../../domain/WorkoutLog.entity';
import { User } from '../../../user/domain/User.entity';
import { Exercise } from '../../../excercise/domain/Exercise.entity';

function workoutLogResponseFormat(workoutLog: WorkoutLog, user: User, exercise: Exercise): any {
  return {
    ...workoutLog,
    user: {
      id: user.id,
      name: user.name,
    },
    exercise: {
      id: exercise.id,
      exerciseName: exercise.exerciseName,
      bodyPart: exercise.bodyPart,
    },
  };
}

export { workoutLogResponseFormat };
