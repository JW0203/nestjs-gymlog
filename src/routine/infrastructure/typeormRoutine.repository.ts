import { RoutineRepository } from '../domain/routine.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { Repository } from 'typeorm';

export class TypeormRoutineRepository implements RoutineRepository {
  constructor(@InjectRepository(Routine) private routineRepository: Repository<Routine>) {}

  async saveRoutine(newRoutine: Routine): Promise<Routine> {
    return await this.routineRepository.save(newRoutine);
  }

  async findOneRoutineByName(name: string, user: User): Promise<Routine | null> {
    return await this.routineRepository.findOne({
      where: { name, user: { id: user.id } },
      relations: ['user'],
    });
  }

  async findOneRoutineById(id: number, user: User): Promise<Routine | null> {
    return await this.routineRepository.findOne({
      where: { id, user: { id: user.id } },
      relations: ['user'],
    });
  }

  async updateRoutine(updateRoutines: Routine): Promise<Routine> {
    return await this.routineRepository.save(updateRoutines);
  }

  async softDeleteRoutine(routineIds: number): Promise<void> {
    await this.routineRepository.softDelete({ id: routineIds });
  }

  async findAllByUserId(userId: number): Promise<Routine[]> {
    return await this.routineRepository.find({ where: { user: { id: userId } }, relations: ['exercise', 'user'] });
  }
}
