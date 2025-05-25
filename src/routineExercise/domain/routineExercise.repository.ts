import { RoutineExercise } from './RoutineExercise.entity';

export interface RoutineExerciseRepository {
  saveRoutineExercises(newRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]>;
  findRoutineExerciseByRoutineId(routineId: number): Promise<RoutineExercise[]>;
  updateRoutineExercise(updateRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]>;
  softDeleteRoutineExercise(ids: number[]): Promise<void>;
}
