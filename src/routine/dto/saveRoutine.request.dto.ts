import { BodyPart } from '../../excercise/domain/bodyPart.enum';

export class SaveRoutineRequestDto {
  routineName: string;
  exerciseName: string;
  bodyPart: BodyPart;
}
