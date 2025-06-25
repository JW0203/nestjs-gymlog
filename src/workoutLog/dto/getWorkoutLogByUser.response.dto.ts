import { WorkoutLog } from '../domain/WorkoutLog.entity';

export interface AggregatedExerciseData {
  maxWeight: number;
  totalSet: number;
}

export interface AggregatedWorkoutData {
  [year: string]: {
    [month: string]: {
      [bodyPart: string]: {
        [exerciseName: string]: AggregatedExerciseData;
      };
    };
  };
}

export interface GetWorkoutLogByUserResponseDto {
  uniqueBodyParts: string[];
  uniqueExerciseNames: string[];
  aggregatedData: AggregatedWorkoutData;
}

export function getWorkoutLogByUserResponse(workoutLogs: WorkoutLog[]): GetWorkoutLogByUserResponseDto {
  const aggregatedData: AggregatedWorkoutData = {};

  workoutLogs.forEach((workoutLog) => {
    const date = new Date(workoutLog.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    const bodyPart = workoutLog.exercise.bodyPart;
    const exerciseName = workoutLog.exercise.exerciseName;
    const weight = workoutLog.weight;
    if (!aggregatedData[year]) {
      aggregatedData[year] = {};
    }
    if (!aggregatedData[year][month]) {
      aggregatedData[year][month] = {};
    }

    if (!aggregatedData[year][month][bodyPart]) {
      aggregatedData[year][month][bodyPart] = {};
    }
    if (!aggregatedData[year][month][bodyPart][exerciseName]) {
      aggregatedData[year][month][bodyPart][exerciseName] = {
        maxWeight: weight,
        totalSet: 0,
      };
    }
    const exerciseData = aggregatedData[year][month][bodyPart][exerciseName];
    if (workoutLog.weight > exerciseData.maxWeight) {
      exerciseData.maxWeight = workoutLog.weight;
    }
    exerciseData.totalSet += 1;
  });

  const bodyParts = workoutLogs.map((workoutLog) => {
    return workoutLog.exercise.bodyPart;
  });
  const uniqueBodyParts = [...new Set(bodyParts)];

  const exerciseNames = workoutLogs.map((workoutLog) => {
    return workoutLog.exercise.exerciseName;
  });
  const uniqueExerciseNames = [...new Set(exerciseNames)];
  return { uniqueBodyParts, uniqueExerciseNames, aggregatedData };
}
