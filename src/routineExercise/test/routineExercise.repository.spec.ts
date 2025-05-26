import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { ROUTINE_EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createTestUserRepo } from '../../../test/utils/createTestUser.repo.layer';
import { createTestRoutineRepo } from '../../../test/utils/createTestRoutine.repo.layer';
import { createTestExerciseRepo } from '../../../test/utils/createTestExercise.repo.layer';
import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { TypeOrmRoutineExerciseRepository } from '../infrastructure/typeormRoutineExercise.repository';
import { User } from '../../user/domain/User.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';

describe('RoutineExercise', () => {
  let routineExerciseRepository: RoutineExerciseRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(getMySqlTypeOrmConfig()), TypeOrmModule.forFeature([RoutineExercise])],
      providers: [
        {
          provide: ROUTINE_EXERCISE_REPOSITORY,
          useClass: TypeOrmRoutineExerciseRepository,
        },
      ],
    }).compile();

    routineExerciseRepository = module.get(ROUTINE_EXERCISE_REPOSITORY);
    dataSource = module.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('saveRoutineExercises', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should should save new RoutineExercises at once', async () => {
      const testUser: User = await createTestUserRepo(dataSource);
      const routine: Routine = await createTestRoutineRepo(dataSource, testUser);
      const exercise: Exercise = await createTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });

      const savedRoutineExercises = await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);
      expect(savedRoutineExercises[0].routine.id).toBe(routine.id);
      expect(savedRoutineExercises[0].exercise.id).toBe(exercise.id);
      expect(savedRoutineExercises[0].order).toBe(1);
    });
  });

  describe('findRoutineExerciseByRoutineId', () => {
    it('should find routineExercise data associated to routine id', async () => {
      const testUser: User = await createTestUserRepo(dataSource);
      const routine: Routine = await createTestRoutineRepo(dataSource, testUser);
      const exercise: Exercise = await createTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });
      await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);

      const foundResult = await routineExerciseRepository.findRoutineExerciseByRoutineId(routine.id);
      expect(foundResult.length).toBe(1);
      expect(foundResult[0].routine.id).toBe(routine.id);
      expect(foundResult[0].routine.name).toBe(routine.name);
      expect(foundResult[0].exercise.exerciseName).toBe(exercise.exerciseName);
      expect(foundResult[0].exercise.bodyPart).toBe(exercise.bodyPart);
    });
  });
});
