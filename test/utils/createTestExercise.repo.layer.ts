import { DataSource } from 'typeorm';
import { Exercise } from '../../src/exercise/domain/Exercise.entity';
import { BodyPart } from '../../src/common/bodyPart.enum';

export async function createTestExerciseRepo(dataSource: DataSource, overrides?: Partial<Exercise>): Promise<Exercise> {
  const exerciseRepository = dataSource.getRepository(Exercise);
  const exerciseData = {
    exerciseName: 'reg-press',
    bodyPart: BodyPart.LEGS,
    ...overrides,
  };
  const newExercise = exerciseRepository.create(exerciseData);
  return await exerciseRepository.save(newExercise);
}
