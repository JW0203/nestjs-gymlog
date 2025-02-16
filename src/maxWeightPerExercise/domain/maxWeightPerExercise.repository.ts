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
}
