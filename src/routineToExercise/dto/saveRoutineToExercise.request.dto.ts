import { Exercise } from '../../excercise/domain/Exercise.entity';
import { Routine } from '../../routine/domain/Routine.entity';

export class SaveRoutineToExerciseRequestDto {
  exercise: Exercise;
  routine: Routine;
}
