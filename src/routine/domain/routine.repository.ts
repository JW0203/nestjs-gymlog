import { User } from '../../user/domain/User.entity';
import { Routine } from './Routine.entity';

export interface RoutineRepository {
  findRoutineByName(name: string, user: User): Promise<Routine | null>;
  findOneRoutineById(id: number, user: User): Promise<Routine | null>;
  findRoutinesByIds(ids: number[], user: User): Promise<Routine[]>;
  bulkUpdateRoutines(updateRoutines: Routine[]): Promise<Routine[]>;
  softDeleteRoutines(routineIds: number[]): Promise<void>;
  findRoutinesByNameLockMode(routineName: string, user: User): Promise<Routine[]>;
  findAllByUserId(userId: number): Promise<Routine[]>;
  saveRoutine(newRoutine: Routine): Promise<Routine>;
}
