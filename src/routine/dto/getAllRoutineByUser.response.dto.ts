import { BodyPart } from '../../common/bodyPart.enum';

export class GetAllRoutineByUserResponseDto {
  id: number;
  name: string;
  exerciseId: number;
  bodyPart: BodyPart;
  exerciseName: string;
  userId: number;

  constructor(routine: any) {
    this.id = routine.id;
    this.name = routine.name;
    this.exerciseId = routine.exercise.id;
    this.bodyPart = routine.exercise.bodyPart;
    this.exerciseName = routine.exercise.exerciseName;
    this.userId = routine.user.id;
  }
}
