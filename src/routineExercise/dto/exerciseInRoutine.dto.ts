import { BodyPart } from '../../common/bodyPart.enum';
import { RoutineExercise } from '../domain/RoutineExercise.entity';

export class ExerciseInRoutineDto {
  id: number;
  order: number;
  exerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart;

  constructor(params: { id: number; order: number; exerciseId: number; exerciseName: string; bodyPart: BodyPart }) {
    if (params) {
      this.id = params.id;
      this.order = params.order;
      this.exerciseId = params.exerciseId;
      this.exerciseName = params.exerciseName;
      this.bodyPart = params.bodyPart;
    }
  }

  static fromData(data: RoutineExercise): ExerciseInRoutineDto {
    return new ExerciseInRoutineDto({
      id: data.id,
      order: data.order,
      exerciseId: data.exercise.id,
      exerciseName: data.exercise.exerciseName,
      bodyPart: data.exercise.bodyPart,
    });
  }
}
