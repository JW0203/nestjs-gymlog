import { UserDataResponseDto } from '../../common/dto/UserData.response.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';

export class RoutineResponseDto {
  id: number;
  name: string;
  user: UserDataResponseDto;
  exercise: ExerciseDataResponseDto;
  createdAt: string;
  updatedAt: string;

  constructor(routine: any) {
    this.id = routine.id;
    this.name = routine.name;
    this.user = new UserDataResponseDto(routine.user);
    this.exercise = new ExerciseDataResponseDto(routine.exercise);
    this.createdAt = routine.createdAt;
    this.updatedAt = routine.updatedAt;
  }
}
