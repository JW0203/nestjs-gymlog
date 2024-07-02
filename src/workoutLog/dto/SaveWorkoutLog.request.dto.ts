import { BodyPart } from '../../excercise/domain/bodyPart.enum';

export class SaveWorkoutLogRequestDto {
  exerciseName: string;
  bodyPart: BodyPart;
  set: number;
  weight: number;
  repeat: number;
}
