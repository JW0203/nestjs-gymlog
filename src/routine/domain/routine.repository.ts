import { User } from '../../user/domain/User.entity';
import { Routine } from './Routine.entity';

export interface RoutineRepository {
  findOneRoutineByName(name: string, user: User): Promise<Routine | null>;
  findOneRoutineById(id: number, user: User): Promise<Routine | null>;
  updateRoutine(updateRoutines: Routine): Promise<Routine>; // 필요없음
  softDeleteRoutines(routineIds: number[]): Promise<void>; // 하나만 지운다.
  findRoutinesByNameLockMode(routineName: string, user: User): Promise<Routine[]>; // 이제 한 routineName으로 된 루틴기록은 한개만 존재
  findAllByUserId(userId: number): Promise<Routine[]>;
  saveRoutine(newRoutine: Routine): Promise<Routine>;
}
