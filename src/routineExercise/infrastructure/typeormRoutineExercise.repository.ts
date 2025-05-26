import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { In, Repository } from 'typeorm';

export class TypeOrmRoutineExerciseRepository implements RoutineExerciseRepository {
  constructor(@InjectRepository(RoutineExercise) private routineExerciseRepository: Repository<RoutineExercise>) {}

  async saveRoutineExercises(newRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]> {
    return await this.routineExerciseRepository.save(newRoutineExercises);
  }
  async findRoutineExerciseByRoutineId(routineId: number): Promise<RoutineExercise[]> {
    return await this.routineExerciseRepository.find({
      where: { routine: { id: routineId } },
      relations: ['routine', 'exercise'],
    });
  }

  async updateRoutineExercise(updateRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]> {
    return await this.routineExerciseRepository.save(updateRoutineExercises);
  }

  async softDeleteRoutineExercise(ids: number[]): Promise<void> {
    await this.routineExerciseRepository.softDelete({ id: In(ids) });
  }
  async findAllRoutineExerciseByRoutineIds(routineIds: number[]): Promise<RoutineExercise[]> {
    return await this.routineExerciseRepository.find({
      where: { routine: { id: In(routineIds) } },
      relations: ['routine', 'exercise'],
    });
  }
}
