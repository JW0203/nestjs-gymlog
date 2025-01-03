import { RoutineRepository } from '../domain/routine.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { In, Repository } from 'typeorm';

export class TypeormRoutineRepository implements RoutineRepository {
  constructor(@InjectRepository(Routine) private routineRepository: Repository<Routine>) {}

  async findRoutinesByNameLockMode(routineName: string, user: User): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });
  }

  async bulkInsertRoutines(newRoutines: Routine[]): Promise<Routine[]> {
    return await this.routineRepository.save(newRoutines);
  }

  async findRoutinesByName(name: string, user: User): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { name, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
  }

  async findOneRoutineById(id: number, user: User): Promise<Routine | null> {
    return await this.routineRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['exercise', 'user'],
    });
  }

  async findRoutinesByIds(ids: number[], user: User): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { id: In(ids), user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
  }

  async bulkUpdateRoutines(updateRoutines: Routine[]): Promise<Routine[]> {
    return await this.routineRepository.save(updateRoutines);
  }

  async softDeleteRoutines(routineIds: number[]): Promise<void> {
    await this.routineRepository.softDelete({ id: In(routineIds) });
  }

  async findAllByUserId(userId: number): Promise<Routine[]> {
    return await this.routineRepository.find({ where: { user: { id: userId } }, relations: ['exercise', 'user'] });
  }
}
