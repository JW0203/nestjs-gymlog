import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';

export class SaveRoutineExerciseRequestDto {
  order: number;
  exercise: Exercise;
  routine: Routine;
}
