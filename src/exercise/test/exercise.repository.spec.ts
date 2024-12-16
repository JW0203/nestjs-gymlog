import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseRepository } from '../domain/exercise.repository';
import { Exercise } from '../domain/Exercise.entity';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { DataSource, In } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { TypeOrmExerciseRepository } from '../infrastructure/typeormExercise.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { Routine } from '../../routine/domain/Routine.entity';
import { User } from '../../user/domain/User.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { LockConfigManager } from '../../common/infrastructure/typeormMysql.lock';
import { MySqlLock } from '../../common/type/typeormLock.type';
import { clearAndResetTable } from '../../../test/utils/dbUtils';
import { TypeormUserRepository } from '../../user/infrastructure/typeormUser.repository';

describe('ExerciseRepository', () => {
  let exerciseRepository: ExerciseRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getMySqlTypeOrmConfig([Exercise, WorkoutLog, Routine, User])),
        TypeOrmModule.forFeature([Exercise]),
      ],
      providers: [{ provide: EXERCISE_REPOSITORY, useClass: TypeOrmExerciseRepository }],
    }).compile();

    exerciseRepository = module.get<ExerciseRepository>(EXERCISE_REPOSITORY);

    dataSource = module.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('bulkInsertExercises', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should save new exercises at once', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const result = await exerciseRepository.bulkInsertExercises(exerciseDtos);
      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toEqual(findQueryResult);
    });
  });

  describe('findOneByExerciseNameAndBodyPart', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should find a exercise data when searching exercise', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [{ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }];
      await exerciseRepository.bulkInsertExercises(exerciseDtos);

      const result = await exerciseRepository.findOneByExerciseNameAndBodyPart('Squat', BodyPart.LEGS);
      const findOneQueryResult = await dataSource
        .getRepository(Exercise)
        .findOne({ where: { exerciseName: 'Squat', bodyPart: BodyPart.LEGS } });

      expect(result).toStrictEqual(findOneQueryResult);
    });

    it('should return null when searching non-existence exercise', async () => {
      const result = await exerciseRepository.findOneByExerciseNameAndBodyPart('Squat', BodyPart.LEGS);
      const findOneQueryResult = await dataSource
        .getRepository(Exercise)
        .findOne({ where: { exerciseName: 'Squat', bodyPart: BodyPart.LEGS } });

      expect(result).toBe(null);
      expect(result).toStrictEqual(findOneQueryResult);
    });
  });

  describe('findExercisesByExerciseNameAndBodyPart', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should find a exercise data when searching exercise', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];
      await exerciseRepository.bulkInsertExercises(exerciseDtos);

      const result = await exerciseRepository.findExercisesByExerciseNameAndBodyPart([
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ]);
      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toEqual(findQueryResult);
    });

    it('should return an empty array when searching non-existence exercise', async () => {
      const result = await exerciseRepository.findExercisesByExerciseNameAndBodyPart([
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ]);
      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toEqual([]);
      expect(result).toStrictEqual(findQueryResult);
    });
  });
  describe('findExercisesByExerciseNameAndBodyPartLockMode', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should find exercises using their exercise name and body part on lock mode', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];
      let result;

      const lockMode: MySqlLock = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });

      await dataSource.transaction(async (manager) => {
        const transactionalRepository = new TypeOrmExerciseRepository(manager.getRepository(Exercise));
        result = await transactionalRepository.findExercisesByExerciseNameAndBodyPartLockMode(exerciseDtos, lockMode);
      });

      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toEqual(findQueryResult);
    });

    it('should return an empty array when searching non-existence exercise', async () => {
      let result;
      const lockMode: MySqlLock = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });

      await dataSource.transaction(async (manager) => {
        const transactionalRepository = new TypeOrmExerciseRepository(manager.getRepository(Exercise));
        result = await transactionalRepository.findExercisesByExerciseNameAndBodyPartLockMode(
          [
            { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
            { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
          ],
          lockMode,
        );
      });

      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toEqual([]);
      expect(result).toStrictEqual(findQueryResult);
    });
  });

  describe('findAll', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should find all exercises', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];
      await exerciseRepository.bulkInsertExercises(exerciseDtos);

      const result = await exerciseRepository.findAll();
      const findQueryResult = await dataSource.getRepository(Exercise).find();

      expect(result.length).toBe(2);
      expect(result).toStrictEqual(findQueryResult);
    });
  });

  describe('findExercisesByIds', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should find exercises using their ids', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];
      await exerciseRepository.bulkInsertExercises(exerciseDtos);

      const result = await exerciseRepository.findExercisesByIds([1, 2]);
      const findQueryResult = await dataSource.getRepository(Exercise).find({ where: { id: In([1, 2]) } });

      expect(result).toStrictEqual(findQueryResult);
    });
  });

  describe('bulkSoftDelete', () => {
    beforeEach(async () => {
      const queryRunner = dataSource.createQueryRunner();
      await queryRunner.connect();
      await clearAndResetTable(queryRunner, 'routine');
      await clearAndResetTable(queryRunner, 'user');
      await clearAndResetTable(queryRunner, 'exercise');
      await queryRunner.release();
    });

    it('should soft delete exercises at once using their ids', async () => {
      const ids = [1, 2];
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];
      await exerciseRepository.bulkInsertExercises(exerciseDtos);

      const result = await exerciseRepository.bulkSoftDelete(ids);
      const findQueryResult = await dataSource
        .getRepository(Exercise)
        .find({ where: { id: In(ids) }, withDeleted: true });

      expect(result).toBe(undefined);
      expect(findQueryResult).not.toBeNull();
      expect(findQueryResult.length).toBe(2);
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
