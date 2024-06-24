import { BodyPart } from '../../excercise/domain/bodyPart.enum';

export class PatchRoutineDataInfoDto {
  routineId: number;
  routineToExerciseId: number;
  exerciseName: string;
  bodyPart: BodyPart;
}
