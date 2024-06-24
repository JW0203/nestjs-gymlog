import { Exercise } from '../../excercise/domain/Exercise.entity';
import { Routine } from '../../routine/domain/Routine.entity';

export class UpdateRoutineToExerciseRequestDto {
  exercise: Exercise;
  routine: Routine;
}
