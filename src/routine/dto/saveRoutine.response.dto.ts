import { ExerciseResponseDto } from '../../excercise/dto/exercise.response.dto';
import { RoutineResponseDto } from './routine.response.dto';

export class SaveRoutineResponseDto {
  exercise: ExerciseResponseDto;
  routine: RoutineResponseDto;
  constructor(params: { exercise: ExerciseResponseDto; routine: RoutineResponseDto }) {
    if (params) {
      this.exercise = params.exercise;
      this.routine = params.routine;
    }
  }
}
