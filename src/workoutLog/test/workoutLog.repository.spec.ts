import { WorkoutLogRepository } from '../domain/workoutLog.repository';
import { DataSource, In, Raw } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { WORKOUTLOG_REPOSITORY } from '../../common/const/inject.constant';
import { TypeormWorkoutLogRepository } from '../infrastructure/typeormWorkoutLog.repository';
import { BodyPart } from '../../common/bodyPart.enum';
import { SaveWorkoutLogFormatDto } from '../dto/saveWorkoutLog.format.dto';

function makeExerciseEntities(workoutLogs: SaveWorkoutLogFormatDto[]): Exercise[] {
  return workoutLogs.map(({ bodyPart, exerciseName }) => {
    return new Exercise({ bodyPart, exerciseName });
  });
}

function excludeFieldsFromItem<T, FieldsToExclude extends keyof T>(
  items: T[],
  fields: FieldsToExclude[],
): Omit<T, FieldsToExclude>[] {
  return items.map((item) => {
    const result = { ...item };
    fields.forEach((field) => delete result[field]);
    return result;
  });
}

function makeWorkoutLogEntities(workoutLogs: SaveWorkoutLogFormatDto[], user: User, exercises: Exercise[]) {
  return workoutLogs.map((workoutLog, i) => {
    const exercise = exercises[i];
    const workoutLogEntity: WorkoutLog = new WorkoutLog({
      setCount: workoutLog.setCount,
      weight: workoutLog.weight,
      repeatCount: workoutLog.repeatCount,
      exercise,
      user,
    });
    workoutLogEntity.id = i + 1;
    workoutLogEntity.createdAt = new Date();
    workoutLogEntity.updatedAt = new Date();
    return workoutLogEntity;
  });
}

describe('WorkoutLogRepository', () => {
  let workoutLogRepository: WorkoutLogRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getMySqlTypeOrmConfig([Routine, User, Exercise, WorkoutLog])),
        TypeOrmModule.forFeature([WorkoutLog]),
      ],
      providers: [{ provide: WORKOUTLOG_REPOSITORY, useClass: TypeormWorkoutLogRepository }],
    }).compile();

    workoutLogRepository = module.get<WorkoutLogRepository>(WORKOUTLOG_REPOSITORY);

    dataSource = module.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('bulkInsertWorkoutLogs', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should save new workoutLogs at once', async () => {
      const user: User = new User({ name: 'test', password: 'password123', email: 'test@example.com' });
      await dataSource.getRepository(User).save(user);

      const newWorkoutLogs = [
        {
          setCount: 1,
          weight: 30,
          repeatCount: 15,
          bodyPart: BodyPart.LEGS,
          exerciseName: '레그 프레스',
        },
        {
          setCount: 2,
          weight: 35,
          repeatCount: 15,
          bodyPart: BodyPart.LEGS,
          exerciseName: '레그 프레스',
        },
      ];

      const exerciseEntities = makeExerciseEntities(newWorkoutLogs);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);
      const workoutLogsEntities = makeWorkoutLogEntities(newWorkoutLogs, user, savedExercises);

      const result = await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);
      const findQueryResult = await dataSource
        .getRepository(WorkoutLog)
        .find({ where: { id: In([1, 2]), user: { id: 1 } }, relations: ['user', 'exercise'] });

      expect(result).toStrictEqual(findQueryResult);
    });
  });

  describe('bulkUpdateWorkoutLogs', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should update workoutLogs at once', async () => {
      const user: User = new User({ name: 'tester', email: 'user@email.com', password: 'password123' });
      await dataSource.getRepository(User).save(user);

      const originWorkoutLogsData = [
        { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { id: 2, setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const exerciseEntities = makeExerciseEntities(originWorkoutLogsData);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);

      const workoutLogsEntities = makeWorkoutLogEntities(originWorkoutLogsData, user, savedExercises);
      await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);

      const changeCount = 15;
      const updateWorkoutLogsData = [
        { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { id: 2, setCount: 2, weight: 0, repeatCount: changeCount, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const updateWorkoutLogsEntities = makeWorkoutLogEntities(updateWorkoutLogsData, user, savedExercises);
      const result = await workoutLogRepository.bulkUpdateWorkoutLogs(updateWorkoutLogsEntities);
      const findQueryResult = await dataSource
        .getRepository(WorkoutLog)
        .find({ where: { id: In([1, 2]), user: { id: 1 } }, relations: ['user', 'exercise'] });

      expect(result[1].repeatCount).toBe(changeCount);

      expect(excludeFieldsFromItem(result, ['deletedAt'])).toEqual(
        excludeFieldsFromItem(findQueryResult, ['deletedAt']),
      );
    });
  });

  describe('findWorkoutLogsByDay', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('it should find workout logs for a specific date', async () => {
      const user: User = new User({ name: 'tester', email: 'user@email.com', password: 'password123' });
      await dataSource.getRepository(User).save(user);

      const workoutLogsData = [
        { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { id: 2, setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const exerciseEntities = makeExerciseEntities(workoutLogsData);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);

      const workoutLogsEntities = makeWorkoutLogEntities(workoutLogsData, user, savedExercises);
      const savedWorkoutLog = await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);

      const date = savedWorkoutLog[0].createdAt.toISOString().split('T')[0];
      const result = await workoutLogRepository.findWorkoutLogsByDay(date, 1);
      const findQueryResult = await dataSource.getRepository(WorkoutLog).find({
        where: {
          createdAt: Raw((alias) => `Date(${alias}) = :date`, { date }),
          user: { id: 1 },
        },
        relations: ['user', 'exercise'],
      });

      expect(result).toEqual(findQueryResult);
    });
  });

  describe('softDeleteWorkoutLogs', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should soft delete workout logs', async () => {
      const user: User = new User({ name: 'tester', email: 'user@email.com', password: 'password123' });
      await dataSource.getRepository(User).save(user);

      const workoutLogsData = [
        { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const exerciseEntities = makeExerciseEntities(workoutLogsData);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);

      const workoutLogsEntities = makeWorkoutLogEntities(workoutLogsData, user, savedExercises);
      await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);

      const result = await workoutLogRepository.softDeleteWorkoutLogs([1, 2], user);
      const findQueryResult = await dataSource
        .getRepository(WorkoutLog)
        .find({ where: { id: In([1, 2]), user: { id: user.id } }, relations: ['user', 'exercise'], withDeleted: true });

      expect(result).toEqual(undefined);
      expect(findQueryResult).not.toBeNull();
      expect(findQueryResult.length).toBe(2);
    });
  });

  describe('findWorkoutLogsByUser', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should find all routines correspond with a user id', async () => {
      const user: User = new User({ name: 'tester', email: 'user@email.com', password: 'password123' });
      await dataSource.getRepository(User).save(user);

      const workoutLogsData = [
        { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const exerciseEntities = makeExerciseEntities(workoutLogsData);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);

      const workoutLogsEntities = makeWorkoutLogEntities(workoutLogsData, user, savedExercises);
      await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);

      const result = await workoutLogRepository.findWorkoutLogsByUser(user);
      const findQueryResult = await dataSource.getRepository(WorkoutLog).find({
        where: { user: { id: user.id } },
        relations: ['exercise'],
      });

      expect(result).toEqual(findQueryResult);
    });
  });

  describe('findWorkoutLogsByIdsLockMode', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should find workoutLogs using their id in the lock mode', async () => {
      const user: User = new User({ name: 'tester', email: 'user@email.com', password: 'password123' });
      await dataSource.getRepository(User).save(user);

      const workoutLogsData = [
        { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
        { setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: '런지' },
      ];

      const exerciseEntities = makeExerciseEntities(workoutLogsData);
      const savedExercises = await dataSource.getRepository(Exercise).save(exerciseEntities);

      const workoutLogsEntities = makeWorkoutLogEntities(workoutLogsData, user, savedExercises);
      await workoutLogRepository.bulkInsertWorkoutLogs(workoutLogsEntities);

      let result;
      await dataSource.transaction(async (manager) => {
        const transactionalRepository = new TypeormWorkoutLogRepository(manager.getRepository(WorkoutLog));
        result = await transactionalRepository.findWorkoutLogsByIdsLockMode([1, 2], 1);
      });
      const findQueryResult = await dataSource
        .getRepository(WorkoutLog)
        .find({ where: { id: In([1, 2]), user: { id: 1 } } });

      expect(result).toStrictEqual(findQueryResult);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
