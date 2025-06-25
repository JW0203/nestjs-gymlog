import { ExerciseInRoutineDto } from '../../routineExercise/dto/exerciseInRoutine.dto';
import { RoutineExercise } from '../../routineExercise/domain/RoutineExercise.entity';

export class SaveRoutineResponseDto {
  routineId: number;
  routineName: string;
  routines: ExerciseInRoutineDto[];

  constructor(params: { routineId: number; routineName: string; routines: ExerciseInRoutineDto[] }) {
    if (params) {
      this.routineId = params.routineId;
      this.routineName = params.routineName;
      this.routines = params.routines;
    }
  }

  static fromEntities(entities: RoutineExercise[]): SaveRoutineResponseDto {
    if (entities.length === 0) {
      throw new Error('RoutineExercise list is empty.');
    }

    const { routine } = entities[0];
    const routines = entities.map((item) => ExerciseInRoutineDto.fromData(item));

    return new SaveRoutineResponseDto({
      routineId: routine.id,
      routineName: routine.name,
      routines,
    });
  }
}
