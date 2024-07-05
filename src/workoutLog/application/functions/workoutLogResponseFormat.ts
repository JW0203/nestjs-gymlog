import { WorkoutLog } from '../../domain/WorkoutLog.entity';

function workoutLogResponseFormat(workoutLogData: WorkoutLog): any {
  return {
    set: workoutLogData.set,
    weight: workoutLogData.weight,
    repeat: workoutLogData.repeat,
    user: {
      id: workoutLogData.user.id,
      name: workoutLogData.user.name,
    },
    exercise: {
      exerciseName: workoutLogData.exercise.exerciseName,
      bodyPart: workoutLogData.exercise.bodyPart,
    },
    createdAt: workoutLogData.createdAt,
    updatedAt: workoutLogData.updatedAt,
    id: workoutLogData.id,
  };
}

export { workoutLogResponseFormat };
