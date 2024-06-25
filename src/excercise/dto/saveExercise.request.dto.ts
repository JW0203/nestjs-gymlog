import { BodyPart } from '../domain/bodyPart.enum';

export class SaveExerciseRequestDto {
  exerciseName: string;
  bodyPart: BodyPart;
}
