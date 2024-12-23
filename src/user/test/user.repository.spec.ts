import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/User.entity';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getMySqlTypeOrmConfig } from '../../../test/utils/getMySql.TypeOrm.config';
import { Routine } from '../../routine/domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { USER_REPOSITORY } from '../../common/const/inject.constant';
import { TypeormUserRepository } from '../infrastructure/typeormUser.repository';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
  initializeTransactionalContext: jest.fn(),
}));

describe('Test UserRepository', () => {
  let userRepository: UserRepository;
  let dataSource: DataSource;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(getMySqlTypeOrmConfig([User, WorkoutLog, Routine, Exercise])), // ,Routine, Exercise, WorkoutLog
        TypeOrmModule.forFeature([User]),
      ],
      providers: [{ provide: USER_REPOSITORY, useClass: TypeormUserRepository }],
    }).compile();

    userRepository = module.get<UserRepository>(USER_REPOSITORY);
    dataSource = module.get<DataSource>(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('signUp', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('Should sign up a new user', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;

      const result = await userRepository.signUp(newUser);
      const findQueryResult = await dataSource.getRepository(User).findOne({ where: { id: 1 } });
      expect(result).toEqual(findQueryResult);
    });
  });

  describe('findOneUserByEmail', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('Should fine one user by the user email', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;
      await userRepository.signUp(newUser);

      const result = await userRepository.findOneUserByEmail(newUser.email);
      const findQueryResult = await dataSource.getRepository(User).findOne({ where: { email: 'test@example.com' } });
      expect(result).toEqual(findQueryResult);
    });

    it('Should return null when user enter not existence user email', async () => {
      const notExistenceUserEmail = 'nobody@email.com';

      const result = await userRepository.findOneUserByEmail(notExistenceUserEmail);
      const findQueryResult = await dataSource.getRepository(User).findOne({ where: { email: notExistenceUserEmail } });
      expect(result).toBe(null);
      expect(result).toEqual(findQueryResult);
    });
  });

  describe('findOneUserByEmailLockMode', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('Should fine one user by the user email', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;
      await userRepository.signUp(newUser);

      let result;
      await dataSource.transaction(async (manager) => {
        const transactionalRepository = new TypeormUserRepository(manager.getRepository(User));
        result = await transactionalRepository.findOneUserByEmailLockMode(newUser.email);
      });

      const findQueryResult = await dataSource.getRepository(User).findOne({ where: { email: 'test@example.com' } });
      expect(result).toEqual(findQueryResult);
    });

    it('Should return null when user enter not existence user email', async () => {
      const notExistenceUserEmail = 'nobody@email.com';

      let result;
      await dataSource.transaction(async (manager) => {
        const transactionalRepository = new TypeormUserRepository(manager.getRepository(User));
        result = await transactionalRepository.findOneUserByEmailLockMode(notExistenceUserEmail);
      });

      const findQueryResult = await dataSource.getRepository(User).findOne({ where: { email: notExistenceUserEmail } });
      expect(result).toBe(null);
      expect(result).toEqual(findQueryResult);
    });
  });

  describe('findOneUserById', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });

    it('Should fine one user by their id using findOneUserById', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: '테스터', password: 'test1234' });
      newUser.id = 1;
      await userRepository.signUp(newUser);

      const result = await userRepository.findOneUserById(newUser.id);
      const findOneQueryResult = await dataSource.getRepository(User).findOne({ where: { id: 1 } });

      expect(result).toEqual(findOneQueryResult);
    });

    it('Should return null when search not-existence user id using findOneUserById', async () => {
      const result = await userRepository.findOneUserById(999);
      const findOneQueryResult = await dataSource.getRepository(User).findOne({ where: { id: 999 } });

      expect(result).toBe(null);
      expect(result).toEqual(findOneQueryResult);
    });
  });

  describe('softDeleteUser', () => {
    beforeEach(async () => {
      await dataSource.dropDatabase();
      await dataSource.synchronize();
    });
    it('Should soft delete a user when using softDeleteUser', async () => {
      const user: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      user.id = 1;
      await userRepository.signUp(user);

      const result = await userRepository.softDeleteUser(1);
      const findOneQueryResult = await dataSource.getRepository(User).findOne({ where: { id: 1 } });
      const findOneWithDeletedQueryResult = await dataSource
        .getRepository(User)
        .findOne({ where: { id: 1 }, withDeleted: true });

      expect(result).toBe(undefined);
      expect(findOneQueryResult).toBe(null);
      expect(findOneWithDeletedQueryResult).not.toBeNull();
    });
  });
});
