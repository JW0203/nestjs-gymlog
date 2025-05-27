import { User } from '../../src/user/domain/User.entity';
import { DataSource } from 'typeorm';
import { Routine } from '../../src/routine/domain/Routine.entity';

export async function createAndSaveTestRoutineRepo(
  dataSource: DataSource,
  user: User,
  overrides: Partial<Routine> = {},
) {
  const routineRepository = dataSource.getRepository(Routine);
  const routineData = {
    user,
    name: 'testRoutine',
    ...overrides,
  };
  const newRoutine = routineRepository.create(routineData);
  return await routineRepository.save(newRoutine);
}
