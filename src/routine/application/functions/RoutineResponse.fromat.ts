import { Routine } from '../../domain/Routine.entity';

export function RoutineResponseFromt(routine: Routine): any {
  return {
    id: routine.id,
    name: routine.name,
    user: {
      id: routine.user.id,
      name: routine.user.name,
    },
    exercise: {
      id: routine.exercise.id,
      exerciseName: routine.exercise.exerciseName,
      bodyPart: routine.exercise.bodyPart,
    },
    createdAt: routine.createdAt,
    updatedAt: routine.updatedAt,
  };
}
