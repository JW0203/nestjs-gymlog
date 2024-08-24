import { User } from '../../user/domain/User.entity';
import { WorkoutLog } from './WorkoutLog.entity';

export interface WorkoutRepository {
  bulkInsertWorkoutLogs(newWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  bulkUpdateWorkoutLogs(UpdateWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]>;
  findWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLog[]>;
  softDeleteWorkoutLogs(ids: number[], user: User): Promise<void>;
  findWorkoutLogByUser(user: User): Promise<WorkoutLog[]>;
  findWorkoutLogsByIdsLockMode(ids: number[], userId: number): Promise<WorkoutLog[]>;
  findOneById(id: number): Promise<WorkoutLog | null>;
}
