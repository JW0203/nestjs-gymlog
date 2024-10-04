import { User } from '../../user/domain/User.entity';
import { Routine } from './Routine.entity';

export interface RoutineRepository {
  bulkInsertRoutines(newRoutines: Routine[]): Promise<Routine[]>;
  findRoutinesByName(name: string, user: User): Promise<Routine[]>;
  findOneRoutineById(id: number, user: User): Promise<Routine | null>;
  findRoutinesByIds(ids: number[], user: User): Promise<Routine[]>;
  bulkUpdateRoutines(updateRoutines: Routine[]): Promise<Routine[]>;
  softDeleteRoutines(routineIds: number[]): Promise<void>;
  findRoutineNameByUserIdLockMode(routineName: string, user: User): Promise<Routine[]>;
  findAllByUserId(userId: number): Promise<Routine[]>;
}
