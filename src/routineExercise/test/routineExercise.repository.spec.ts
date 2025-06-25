import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { ROUTINE_EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createAndSaveTestUserRepo } from '../../../test/utils/createAndSaveTestUser.repo.layer';
import { createAndSaveTestRoutineRepo } from '../../../test/utils/createAndSaveTestRoutine.repo.layer';
import { createAndSaveTestExerciseRepo } from '../../../test/utils/createAndSaveTestExercise.repo.layer';
import { RoutineExerciseRepository } from '../domain/routineExercise.repository';
import { TypeOrmRoutineExerciseRepository } from '../infrastructure/typeormRoutineExercise.repository';
import { User } from '../../user/domain/User.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';

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
      const testUser: User = await createAndSaveTestUserRepo(dataSource);
      const routine: Routine = await createAndSaveTestRoutineRepo(dataSource, testUser);
      const exercise: Exercise = await createAndSaveTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });

      const savedRoutineExercises = await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);
      expect(savedRoutineExercises[0].routine.id).toBe(routine.id);
      expect(savedRoutineExercises[0].exercise.id).toBe(exercise.id);
      expect(savedRoutineExercises[0].order).toBe(1);
    });
  });

  describe('findRoutineExerciseByRoutineId', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should find routineExercise data associated to routine id', async () => {
      const testUser: User = await createAndSaveTestUserRepo(dataSource);
      const routine: Routine = await createAndSaveTestRoutineRepo(dataSource, testUser);
      const exercise: Exercise = await createAndSaveTestExerciseRepo(dataSource);
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

  describe('updateRoutineExercise', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should update updateRoutineExercise', async () => {
      const testUser: User = await createAndSaveTestUserRepo(dataSource);
      const routine: Routine = await createAndSaveTestRoutineRepo(dataSource, testUser);
      const exercise: Exercise = await createAndSaveTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });
      const savedRoutineExercise = await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);

      const update = savedRoutineExercise[0];
      update.routine.name = 'updateRoutineName';
      update.exercise.exerciseName = 'abs';
      update.exercise.bodyPart = BodyPart.ABS;

      const updatedResult = await routineExerciseRepository.updateRoutineExercise([update]);
      expect(updatedResult.length).toBe(1);
      expect(updatedResult[0].routine.id).toBe(routine.id);
      expect(updatedResult[0].routine.name).toBe('updateRoutineName');
      expect(updatedResult[0].exercise.exerciseName).toBe('abs');
      expect(updatedResult[0].exercise.bodyPart).toBe(BodyPart.ABS);
    });

    it('should insert a new RoutineExercise', async () => {
      const user = await createAndSaveTestUserRepo(dataSource);
      const routine = await createAndSaveTestRoutineRepo(dataSource, user);
      const exercise = await createAndSaveTestExerciseRepo(dataSource);

      const newRoutineExercise = new RoutineExercise({ routine, exercise, order: 1 });

      const result = await routineExerciseRepository.updateRoutineExercise([newRoutineExercise]);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBeDefined();
      expect(result[0].routine.id).toBe(routine.id);
      expect(result[0].exercise.id).toBe(exercise.id);
    });

    it('should insert and update mixed RoutineExercises', async () => {
      const user = await createAndSaveTestUserRepo(dataSource);
      const routine = await createAndSaveTestRoutineRepo(dataSource, user);
      const exercise1 = await createAndSaveTestExerciseRepo(dataSource, { exerciseName: 'A' });
      const exercise2 = await createAndSaveTestExerciseRepo(dataSource, { exerciseName: 'B' });
      const exercise3 = await createAndSaveTestExerciseRepo(dataSource, { exerciseName: 'C' });

      const saved = await routineExerciseRepository.saveRoutineExercises([
        new RoutineExercise({ routine, exercise: exercise1, order: 1 }),
        new RoutineExercise({ routine, exercise: exercise2, order: 2 }),
      ]);

      const update = saved[0];
      update.order = 100;

      const insert = new RoutineExercise({ routine, exercise: exercise3, order: 3 });

      const result = await routineExerciseRepository.updateRoutineExercise([update, insert]);

      expect(result).toHaveLength(2);
      const updated = result.find((r) => r.id === update.id);
      const inserted = result.find((r) => r.exercise.id === exercise3.id);

      expect(updated?.order).toBe(100);
      expect(updated?.id).toBe(update.id);
      expect(inserted?.id).toBeDefined();
      expect(inserted?.exercise.exerciseName).toBe('C');
    });

    it('should return empty array when input is empty', async () => {
      const result = await routineExerciseRepository.updateRoutineExercise([]);
      expect(result).toEqual([]);
    });
  });

  describe('softDeleteRoutineExercise', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should delete routineExercise associated with routineExercise ids', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const routine: Routine = await createAndSaveTestRoutineRepo(dataSource, user);
      const exercise: Exercise = await createAndSaveTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });
      const savedRoutineExercise = await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);
      const ids = savedRoutineExercise.map((entity) => entity.id);

      const result = await routineExerciseRepository.softDeleteRoutineExercise(ids);
      expect(result).not.toBeDefined();
    });
  });

  describe('findAllRoutineExerciseByRoutineIds', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('it should find routineExercises  associated with given routineIds', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const routine: Routine = await createAndSaveTestRoutineRepo(dataSource, user);
      const exercise: Exercise = await createAndSaveTestExerciseRepo(dataSource);
      const routineExerciseData = new RoutineExercise({ routine: routine, exercise: exercise, order: 1 });
      const savedRoutineExercise = await routineExerciseRepository.saveRoutineExercises([routineExerciseData]);
      const routineIds = savedRoutineExercise.map((entity) => entity.routine.id);

      const result = await routineExerciseRepository.findAllRoutineExerciseByRoutineIds(routineIds);
      // console.log(result);
      expect(result[0].routine.id).toBe(1);
    });
  });
});
