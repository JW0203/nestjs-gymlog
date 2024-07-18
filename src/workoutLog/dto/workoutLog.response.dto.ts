import { UserDataResponseDto } from '../../common/dto/UserData.response.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { validateOrReject } from 'class-validator';

export class WorkoutLogResponseDto {
  id: number;
  setCount: number;
  weight: number;
  repeatCount: number;
  user: UserDataResponseDto;
  exercise: ExerciseDataResponseDto;
  createdAt: string;
  updatedAt: string;

  constructor(workoutLog: any) {
    this.id = workoutLog.id;
    this.setCount = workoutLog.setCount;
    this.weight = workoutLog.weight;
    this.repeatCount = workoutLog.repeatCount;
    this.user = new UserDataResponseDto(workoutLog.user);
    this.exercise = new ExerciseDataResponseDto(workoutLog.exercise);
    this.createdAt = workoutLog.createdAt;
    this.updatedAt = workoutLog.updatedAt;

    validateOrReject(this).catch((errors) => {
      console.log('(workoutLog response validation errors) Error:', errors);
    });
  }
}
