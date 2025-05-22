import { RoutineExercise } from './RoutineExercise.entity';

export interface RoutineExerciseRepository {
  saveRoutineExercises(newRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]>;
}
