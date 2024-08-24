import { User } from '../../user/domain/User.entity';
import { Routine } from './Routine.entity';

export interface RoutineRepository {
  bulkInsertRoutines(newRoutines: Routine[]): Promise<Routine[]>;
  getOneRoutineByName(name: string, user: User): Promise<Routine | null>;
  getRoutinesByName(name: string, user: User): Promise<Routine[]>;
  bulkUpdateRoutines(updateRoutines: Routine[]): Promise<Routine[]>;
  softDeleteRoutines(routineIds: number[]): Promise<void>;
  findRoutineNameByUserIdLockMode(routineName: string, user: User): Promise<Routine[]>;
}
