import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { In, Raw, Repository } from 'typeorm';
import { User } from '../../user/domain/User.entity';
import { WorkoutLogRepository } from '../domain/workoutLog.repository';

@Injectable()
export class TypeormWorkoutLogRepository implements WorkoutLogRepository {
  constructor(
    @InjectRepository(WorkoutLog)
    private workoutLogRepository: Repository<WorkoutLog>,
  ) {}

  async bulkInsertWorkoutLogs(newWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.save(newWorkoutLogs);
  }

  async bulkUpdateWorkoutLogs(UpdateWorkoutLogs: WorkoutLog[]): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.save(UpdateWorkoutLogs);
  }

  async findWorkoutLogsByIdsLockMode(ids: number[], userId: number): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.find({
      where: { id: In(ids), user: { id: userId } },
      lock: { mode: 'pessimistic_write' },
    });
  }

  async findOneById(id: number): Promise<WorkoutLog | null> {
    return await this.workoutLogRepository.findOne({
      where: { id },
      relations: ['user', 'exercise'],
    });
  }

  async findWorkoutLogsByDay(date: string, userId: number): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.find({
      where: {
        createdAt: Raw((alias) => `Date(${alias}) = :date`, { date }),
        user: { id: userId },
      },
      relations: ['exercise', 'user'],
    });
  }
  async softDeleteWorkoutLogs(ids: number[], user: User): Promise<void> {
    await this.workoutLogRepository.softDelete({ id: In(ids), user: { id: user.id } });
  }

  async findWorkoutLogsByUser(user: User): Promise<WorkoutLog[]> {
    return await this.workoutLogRepository.find({
      where: { user: { id: user.id } },
      relations: ['exercise'],
    });
  }
}
