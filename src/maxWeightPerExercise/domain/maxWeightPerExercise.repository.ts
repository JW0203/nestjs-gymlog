import { MaxWeightPerExercise } from './MaxWeightPerExercise.entity';
import { FindMaxWeightRequestDto } from '../dto/findMaxWeight.request.dto';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInMaxWeightRequestDto } from '../dto/updateUserNickNameInMaxWeight.request.dto';
import { BestWorkoutLog } from '../../workoutLog/dto/findBestWorkoutLogs.response.dto';

export interface MaxWeightPerExerciseRepository {
  findMaxWeight(data: FindMaxWeightRequestDto): Promise<MaxWeightPerExercise | null>;
  bulkSaveMaxWeightPerExercise(saveData: MaxWeightPerExercise[]): Promise<MaxWeightPerExercise[]>;
  updateExerciseNameInMaxWeight(updateData: UpdateExerciseNameRequestDto): Promise<any>;
  updateUserNickNameInMaxWeight(updateUserNickNameRequestDto: UpdateUserNickNameInMaxWeightRequestDto): Promise<any>;
  renewalMaxWeightPerExercise(renewalData: BestWorkoutLog[]): Promise<MaxWeightPerExercise[]>;
  clearTable(): Promise<void>;
  getBestWorkoutLogs(): Promise<MaxWeightPerExercise[]>;
  // updateMaxWeightAfterUserDeletion(userData: dto): Promise<?[]>; // 발생하는 경우... ? 1.유저가 사라 졌을 때? 2. 운동이름이 지워졌을때 이 두경우를 사용하면 dto 가 문제네 -> 따로 만들자.
  // updateMaxWeightAfterExerciseDeletion(exerciseData: dto): Promise<?[]>;
}
