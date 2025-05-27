import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { User } from '../../user/domain/User.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { TypeormRoutineRepository } from '../infrastructure/typeormRoutine.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { UpdateRoutine } from '../dto/updateRoutine.dto';
import { createAndSaveTestUserRepo } from '../../../test/utils/createAndSaveTestUser.repo.layer';
import { createAndSaveTestRoutineRepo } from '../../../test/utils/createAndSaveTestRoutine.repo.layer';

describe('Test RoutineRepository', () => {
  let routineRepository: RoutineRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(getMySqlTypeOrmConfig()), TypeOrmModule.forFeature([Routine, User, Exercise])],
      providers: [
        {
          provide: ROUTINE_REPOSITORY,
          useClass: TypeormRoutineRepository,
        },
      ],
    }).compile();
    routineRepository = module.get<RoutineRepository>(ROUTINE_REPOSITORY);
    dataSource = module.get<DataSource>(DataSource);
    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  describe('saveRoutine', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });
    it('should save a routine', async () => {
      const user = await createAndSaveTestUserRepo(dataSource);
      user.id = 1;
      const routineName = 'testRoutine';
      const newRoutine = new Routine({ name: routineName, user });

      const result = await routineRepository.saveRoutine(newRoutine);
      const queryResult = await dataSource.getRepository(Routine).findOne({
        where: { id: result.id },
        relations: ['user'],
      });

      expect(result).toEqual(queryResult);
      expect(result.user.id).toBe(user.id);
      expect(result.name).toBe(routineName);
      expect(result.id).toBe(1);
    });
  });

  describe('findOneRoutineByName', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return an empty array when a user searches for a non-existent routine name', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const notExistRoutineName: string = 'back-routine';
      const result = await routineRepository.findOneRoutineByName(notExistRoutineName, user);

      expect(result).toBeNull();
    });

    it('should find routines saved by the user when a user searches for a routine name', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const routine = await createAndSaveTestRoutineRepo(dataSource, user);

      const result = await routineRepository.findOneRoutineByName(routine.name, user);
      const queryResult = await dataSource.getRepository(Routine).findOne({
        where: { name: routine.name },
        relations: ['user'],
      });

      expect(result).not.toBeNull();
      expect(result).toEqual(queryResult);
      expect(result?.name).toBe(routine.name);
      expect(result?.user.id).toBe(user.id);
    });
  });

  describe('findOneRoutineById', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should find a routine saved by a user when a user searches for a routine id', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const routine = await createAndSaveTestRoutineRepo(dataSource, user);

      await routineRepository.saveRoutine(routine);

      const result = await routineRepository.findOneRoutineById(1, user);
      const findOneQueryResult = await dataSource
        .getRepository(Routine)
        .findOne({ where: { id: 1, user: { id: 1 } }, relations: ['user'] });

      expect(result).not.toBeNull();
      expect(result).toStrictEqual(findOneQueryResult);
    });

    it('should return null when a user searches for a non-existent routine id', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);

      const result = await routineRepository.findOneRoutineById(999, user);
      const findOneQueryResult = await dataSource
        .getRepository(Routine)
        .findOne({ where: { id: 999, user: { id: 1 } }, relations: ['user'] });
      expect(result).toEqual(null);
      expect(result).toStrictEqual(findOneQueryResult);
    });
  });

  describe('updateRoutine', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return an updated routine when a user update a routine', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      const routine = await createAndSaveTestRoutineRepo(dataSource, user);
      routine.name = 'updated Routine';

      const result = await routineRepository.updateRoutine(routine);

      expect(result.id).toBe(routine.id);
      expect(result.name).toBe(routine.name);
    });
  });

  describe('softDeleteRoutines', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should soft delete routines when user delete routines with their ids', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      await createAndSaveTestRoutineRepo(dataSource, user);

      const result = await routineRepository.softDeleteRoutines([1]);

      const findQueryResult = await routineRepository.findOneRoutineById(1, user);
      const findOneWithDeletedQueryResult = await dataSource
        .getRepository(Routine)
        .findOne({ where: { id: 1 }, withDeleted: true });

      expect(result).toBe(undefined);
      expect(findQueryResult).toBeNull();
      expect(findOneWithDeletedQueryResult).not.toBeNull();
      expect(findOneWithDeletedQueryResult?.id).toBe(1);
    });
  });

  describe('findAllByUserId', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return all routines when a user find routines by user ID', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      await createAndSaveTestRoutineRepo(dataSource, user);
      await createAndSaveTestRoutineRepo(dataSource, user, { name: 'testRoutine2' });

      const result = await routineRepository.findAllByUserId(user.id);
      const findQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { user: { id: user.id } }, relations: ['user'] });

      expect(result).toEqual(findQueryResult);
      expect(result[0].name).toBe('testRoutine');
      expect(result[1].name).toBe('testRoutine2');
    });
  });

  describe('findRoutinesByIds', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('should return routines when a user requests them by routine IDs', async () => {
      const user: User = await createAndSaveTestUserRepo(dataSource);
      await createAndSaveTestRoutineRepo(dataSource, user);
      await createAndSaveTestRoutineRepo(dataSource, user, { name: 'testRoutine2' });
      await createAndSaveTestRoutineRepo(dataSource, user, { name: 'testRoutine3' });

      const result = await routineRepository.findRoutinesByIds([1, 2], user);
      const findQueryResult = await dataSource
        .getRepository(Routine)
        .find({ where: { id: In([1, 2]), user: { id: user.id } }, relations: ['user'] });

      expect(result).toEqual(findQueryResult);
      expect(result[0].user.id).toBe(1);
      expect(result[0].id).toBe(1);
      expect(result[0].name).toBe('testRoutine');
      expect(result[1].id).toBe(2);
      expect(result[1].name).toBe('testRoutine2');
    });
  });

  afterAll(async () => {
    await dataSource.destroy();
  });
});
