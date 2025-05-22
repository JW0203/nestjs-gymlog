import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { Repository } from 'typeorm';

export class TypeOrmRoutineExerciseRepository implements RoutineExerciseRepository {
  constructor(@InjectRepository(RoutineExercise) private routineExerciseRepository: Repository<RoutineExercise>) {}

  async saveRoutineExercises(newRoutineExercises: RoutineExercise[]): Promise<RoutineExercise[]> {
    return await this.routineExerciseRepository.save(newRoutineExercises);
  }
}
