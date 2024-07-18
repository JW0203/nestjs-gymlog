import { UserDataResponseDto } from '../../common/dto/UserData.response.dto';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { IsDate, IsInt, IsNotEmpty, IsNumber, Max, Min, validateOrReject } from 'class-validator';

export class WorkoutLogResponseDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100)
  setCount: number;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(1000)
  weight: number;

  @IsNotEmpty()
  @IsNumber()
  repeatCount: number;

  @IsNotEmpty()
  user: UserDataResponseDto;
  @IsNotEmpty()
  exercise: ExerciseDataResponseDto;

  @IsNotEmpty()
  @IsDate()
  createdAt: string;
  @IsNotEmpty()
  @IsDate()
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
