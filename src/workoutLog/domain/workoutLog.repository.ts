import { User } from '../../user/domain/User.entity';
import { WorkoutLog } from './WorkoutLog.entity';

export interface WorkoutLogRepository {
  bulkInsertWorkoutLogs(newWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  bulkUpdateWorkoutLogs(UpdateWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  findWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLog[]>;
  softDeleteWorkoutLogs(ids: number[], user: User): Promise<void>;
  findWorkoutLogsByUser(user: User): Promise<WorkoutLog[]>;
  findWorkoutLogsByIdsLockMode(ids: number[], userId: number): Promise<WorkoutLog[]>;
}
