import { BodyPart } from '../../excercise/domain/bodyPart.enum';

export class ExerciseDataRequestDto {
  bodyPart: BodyPart;
  exerciseName: string;
}
