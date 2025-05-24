import { BodyPart } from '../../common/bodyPart.enum';

export class FindDataByRoutineIdResponseDto {
  routineName: string;
  routines: RoutineExerciseItemDto[];

  constructor(params: { routineName: string; routines: RoutineExerciseItemDto[] }) {
    this.routineName = params.routineName;
    this.routines = params.routines;
  }
}

export class RoutineExerciseItemDto {
  id: number;
  order: number;
  exerciseName: string;
  bodyPart: BodyPart;

  constructor(params: { id: number; order: number; exerciseName: string; bodyPart: BodyPart }) {
    this.id = params.id;
    this.order = params.order;
    this.exerciseName = params.exerciseName;
    this.bodyPart = params.bodyPart;
  }

  static fromEntity(data: {
    id: number;
    order: number;
    exercise: { exerciseName: string; bodyPart: BodyPart };
  }): RoutineExerciseItemDto {
    return new RoutineExerciseItemDto({
      id: data.id,
      order: data.order,
      exerciseName: data.exercise.exerciseName,
      bodyPart: data.exercise.bodyPart,
    });
  }
}
