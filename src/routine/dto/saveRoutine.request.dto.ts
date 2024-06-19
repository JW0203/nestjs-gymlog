import { BodyPart } from '../../excercise/domain/bodyPart.enum';

export class SaveRoutineRequestDto {
  routineName: string;
  userId: number;
  exerciseName: string;
  bodyPart: BodyPart;
}
