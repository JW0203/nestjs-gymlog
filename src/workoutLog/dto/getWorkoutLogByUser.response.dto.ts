import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { AggregatedResultDTO } from './aggregatedWorkoutLogs.data.dto';

export function GetWorkoutLogByUserResponseDto(workoutLogs: WorkoutLog[]): any {
  const aggregatedData = new AggregatedResultDTO();
  workoutLogs.forEach((workoutLog) => {
    const date = new Date(workoutLog.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const bodyPart = workoutLog.exercise.bodyPart;
    const exerciseName = workoutLog.exercise.exerciseName;
    const weight = workoutLog.weight;
    if (!aggregatedData.year[year]) {
      aggregatedData.year[year] = {};
    }
    if (!aggregatedData.year[year][bodyPart]) {
      aggregatedData.year[year][bodyPart] = {};
    }
    if (!aggregatedData.year[year][bodyPart][exerciseName]) {
      aggregatedData.year[year][bodyPart][exerciseName] = [];
    }
    aggregatedData.year[year][bodyPart][exerciseName].push(weight);

    if (!aggregatedData.month[month]) {
      aggregatedData.month[month] = {};
    }
    if (!aggregatedData.month[month][bodyPart]) {
      aggregatedData.month[month][bodyPart] = {};
    }
    if (!aggregatedData.month[month][bodyPart][exerciseName]) {
      aggregatedData.month[month][bodyPart][exerciseName] = [];
    }
    aggregatedData.month[month][bodyPart][exerciseName].push(weight);
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
