import { User } from '../../user/domain/User.entity';
import { WorkoutLog } from './WorkoutLog.entity';
import { BestWorkoutLog } from '../dto/findBestWorkoutLogs.response.dto';
import { FindWorkoutLogsByYearMonthResponseDto } from '../dto/findWorkoutLogsByYearMonth.response.dto';
import { FindWorkoutLogsByYearResponseDto } from '../dto/findWorkoutLogsByYear.response.dto';
import { UpdateExerciseNameRequestDto } from '../../exercise/dto/updateExerciseName.request.dto';
import { UpdateUserNickNameInWorkOutLogRequestDto } from '../dto/updateUserNickNameInWorkoutLog.request.dto';

export interface WorkoutLogRepository {
  bulkInsertWorkoutLogs(newWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  bulkUpdateWorkoutLogs(UpdateWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  findWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLog[]>;
  softDeleteWorkoutLogs(ids: number[], user: User): Promise<void>;
  findWorkoutLogsByUser(user: User): Promise<WorkoutLog[]>;
  findWorkoutLogsByIdsLockMode(ids: number[], userId: number): Promise<WorkoutLog[]>;
  findWorkoutLogsByYear(user: User, year: string): Promise<FindWorkoutLogsByYearResponseDto[]>;
  findWorkoutLogsByYearMonth(user: User, year: string, month: string): Promise<FindWorkoutLogsByYearMonthResponseDto[]>;
  findBestWorkoutLogs(): Promise<BestWorkoutLog[]>;
  updateExerciseNameInWorkoutLog(updateData: UpdateExerciseNameRequestDto): Promise<any>;
  updateUserNickNameInWorkoutLog(updateData: UpdateUserNickNameInWorkOutLogRequestDto): Promise<any>;
}
