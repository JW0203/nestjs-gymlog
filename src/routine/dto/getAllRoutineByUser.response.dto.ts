import { Routine } from '../domain/Routine.entity';

export class GetAllRoutineByUserResponseDto {
  id: number;
  name: string;
  userId: number;

  constructor(routine: Routine) {
    this.id = routine.id;
    this.name = routine.name;
    this.userId = routine.user.id;
  }
}
