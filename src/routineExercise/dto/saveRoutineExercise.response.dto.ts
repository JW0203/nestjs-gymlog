import { BodyPart } from '../../common/bodyPart.enum';

export class SaveRoutineExerciseResponseDto {
  id: number;
  order: number;
  routineId: number;
  routineName: string;
  exerciseId: number;
  exerciseName: string;
  exerciseBodyPart: BodyPart;
}
