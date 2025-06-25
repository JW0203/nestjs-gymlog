import { User } from '../../user/domain/User.entity';
import { Routine } from './Routine.entity';

export interface RoutineRepository {
  findOneRoutineByName(name: string, user: User): Promise<Routine | null>;
  findOneRoutineById(id: number, user: User): Promise<Routine | null>;
  findRoutinesByIds(ids: number[], user: User): Promise<Routine[]>;
  updateRoutine(updateRoutine: Routine): Promise<Routine>;
  softDeleteRoutines(routineIds: number[]): Promise<void>;
  findAllByUserId(userId: number): Promise<Routine[]>;
  saveRoutine(newRoutine: Routine): Promise<Routine>;
}
