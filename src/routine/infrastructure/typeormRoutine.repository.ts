import { RoutineRepository } from '../domain/routine.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { In, Repository } from 'typeorm';
import { ExerciseService } from '../../excercise/application/exercise.service';

export class TypeormRoutineRepository implements RoutineRepository {
  constructor(
    @InjectRepository(Routine) private routineRepository: Repository<Routine>,
    readonly exerciseService: ExerciseService,
  ) {}

  async findRoutineNameByUserIdLockMode(routineName: string, user: User): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { name: routineName, user: { id: user.id } },
      relations: ['user'],
      lock: { mode: 'pessimistic_write' },
    });
  }

  async bulkInsertRoutines(newRoutines: Routine[]): Promise<Routine[]> {
    return await this.routineRepository.save(newRoutines);
  }

  async findOneRoutineByName(name: string, user: User): Promise<Routine | null> {
    return await this.routineRepository.findOne({
      where: { name, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
  }

  async findRoutinesByName(name: string, user: User): Promise<Routine[]> {
    return await this.routineRepository.find({
      where: { name, user: { id: user.id } },
      relations: ['user', 'exercise'],
    });
  }

  async bulkUpdateRoutines(updateRoutines: Routine[]): Promise<Routine[]> {
    return await this.routineRepository.save(updateRoutines);
  }

  async softDeleteRoutines(routineIds: number[]): Promise<void> {
    await this.routineRepository.softDelete({ id: In(routineIds) });
  }
}
