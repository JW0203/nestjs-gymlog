import { ExerciseResponseDto } from '../../excercise/dto/exercise.response.dto';
import { RoutineResponseDto } from '../../routine/dto/routine.response.dto';
import { UserResponseDto } from '../../user/dto/user.response.dto';

export function TransformSaveRoutineResult(data: any): any {
  return {
    exercise: new ExerciseResponseDto({ ...data.exercise }),
    routine: new RoutineResponseDto({
      id: data.routine.id,
      name: data.routine.name,
      user: new UserResponseDto({ ...data.routine.user }),
    }),
  };
}
