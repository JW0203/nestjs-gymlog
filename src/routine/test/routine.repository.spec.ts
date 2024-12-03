import { RoutineRepository } from '../domain/routine.repository';
import { Routine } from '../domain/Routine.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { User } from '../../user/domain/User.entity';

const mockRoutineRepository: jest.Mocked<RoutineRepository> = {
  bulkInsertRoutines: jest.fn(),
  findRoutinesByName: jest.fn(),
  findOneRoutineById: jest.fn(),
  findRoutinesByIds: jest.fn(),
  bulkUpdateRoutines: jest.fn(),
  softDeleteRoutines: jest.fn(),
  findRoutineNameByUserIdLockMode: jest.fn(),
  findAllByUserId: jest.fn(),
};

describe('Test RoutineRepository', () => {
  let routineRepository: jest.Mocked<RoutineRepository>;

  beforeEach(async () => {
    routineRepository = mockRoutineRepository;
  });

  describe('bulkInsertRoutines', () => {
    it('should save routines at once', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName = '다리 루틴';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '스모 데드리프트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine2.id = 2;

      routineRepository.bulkInsertRoutines.mockResolvedValue([mockRoutine1, mockRoutine2]);

      const result: Routine[] = await routineRepository.bulkInsertRoutines([mockRoutine1, mockRoutine2]);
      expect(result).toEqual([mockRoutine1, mockRoutine2]);
      expect(mockRoutineRepository.bulkInsertRoutines).toHaveBeenCalledWith([mockRoutine1, mockRoutine2]);
    });
  });

  describe('findRoutinesByName', () => {
    it('should return a routine when searching by the name of a routine registered by a user', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName: string = '등데이';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '어시스트 풀업 머신', bodyPart: BodyPart.BACK }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '케이블 암 풀다운', bodyPart: BodyPart.BACK }),
      });
      mockRoutine2.id = 2;

      routineRepository.findRoutinesByName.mockResolvedValue([mockRoutine1, mockRoutine2]);
      const result = await routineRepository.findRoutinesByName(routineName, mockUser);
      expect(result).toEqual([mockRoutine1, mockRoutine2]);
      expect(mockRoutineRepository.findRoutinesByName).toHaveBeenCalledWith(routineName, mockUser);
    });

    it('should return empty array when given routine name is not existing', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName: string = '등데이';

      routineRepository.findRoutinesByName.mockResolvedValue([]);

      const result = await routineRepository.findRoutinesByName(routineName, mockUser);

      expect(result).toEqual([]);
      expect(routineRepository.findRoutinesByName).toHaveBeenCalledWith(routineName, mockUser);
    });
  });

  describe('findOneRoutineById', () => {
    it('should return a routine when searching by its id', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName: string = '등데이';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '어시스트 풀업 머신', bodyPart: BodyPart.BACK }),
      });
      mockRoutine1.id = 1;

      routineRepository.findOneRoutineById.mockResolvedValue(mockRoutine1);
      const result = await routineRepository.findOneRoutineById(1, mockUser);

      expect(result).toEqual(mockRoutine1);
      expect(routineRepository.findOneRoutineById).toHaveBeenCalledWith(1, mockUser);
    });

    it('should return null when a routine searched by a id that is not exist', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName: string = '등데이';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '어시스트 풀업 머신', bodyPart: BodyPart.BACK }),
      });
      mockRoutine1.id = 1;

      routineRepository.findOneRoutineById.mockResolvedValue(null);
      const result = await routineRepository.findOneRoutineById(1, mockUser);

      expect(result).toEqual(null);
      expect(routineRepository.findOneRoutineById).toHaveBeenCalledWith(1, mockUser);
    });
  });
  describe('findRoutinesByIds', () => {
    let mockUser: User;
    let mockRoutines: Routine[];
    let routineIds: number[];

    beforeEach(() => {
      mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      const routineName = '다리 루틴';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '스모 데드리프트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine2.id = 2;
      mockRoutines = [mockRoutine1, mockRoutine2];
      routineIds = [1, 2];
    });

    it('should return an array of routines when searching routines by ids', async () => {
      routineRepository.findRoutinesByIds.mockResolvedValue(mockRoutines);

      const result = await routineRepository.findRoutinesByIds(routineIds, mockUser);

      expect(result).toEqual(mockRoutines);
      expect(routineRepository.findRoutinesByIds).toHaveBeenCalledWith(routineIds, mockUser);
      expect(result.length).toBe(2);
    });

    it('should return one routine when one of given ids is not exist ', async () => {
      routineRepository.findRoutinesByIds.mockResolvedValue([]);

      const result = await routineRepository.findRoutinesByIds([1, 999], mockUser);

      expect(result).toEqual([]);
      expect(routineRepository.findRoutinesByIds).toHaveBeenCalledWith([1, 999], mockUser);
    });

    it('should return empty array when given empty array', async () => {
      routineRepository.findRoutinesByIds.mockResolvedValue([]);

      const result = await routineRepository.findRoutinesByIds([], mockUser);

      expect(result).toEqual([]);
      expect(routineRepository.findRoutinesByIds).toHaveBeenCalledWith([], mockUser);
    });
  });

  describe('bulkUpdateRoutines', () => {
    let mockUser: User;
    let mockRoutine1: Routine;
    let mockRoutine2: Routine;

    beforeEach(() => {
      mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      const routineName = '다리 루틴';

      mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '스모 데드리프트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine1.id = 1;

      mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine2.id = 2;
    });

    it('should return updated data array of routines with updated data', async () => {
      mockUser = new User({ email: 'test@email.com', name: 'tester', password: 'password1234' });
      mockUser.id = 1;

      const updatedRoutine1 = mockRoutine1;
      updatedRoutine1.name = '수정된 루틴';

      const updatedRoutine2 = mockRoutine2;
      updatedRoutine2.exercise = new Exercise({ exerciseName: '런지', bodyPart: BodyPart.LEGS });

      routineRepository.bulkUpdateRoutines.mockResolvedValue([updatedRoutine1, updatedRoutine2]);
      const result = await routineRepository.bulkUpdateRoutines([updatedRoutine1, updatedRoutine2]);

      expect(result).toEqual([updatedRoutine1, updatedRoutine2]);
      expect(result[0].name).toBe('수정된 루틴');
      expect(result[1].exercise).toStrictEqual(new Exercise({ exerciseName: '런지', bodyPart: BodyPart.LEGS }));
    });
  });

  describe('softDeleteRoutines', () => {
    it('should remove several routines in the soft way', async () => {
      const routineIds = [1, 2, 3];

      routineRepository.softDeleteRoutines.mockResolvedValue();
      await mockRoutineRepository.softDeleteRoutines(routineIds);

      expect(mockRoutineRepository.softDeleteRoutines).toHaveBeenCalledWith(routineIds);
    });

    it('should work correctly  when a empty array is given', async () => {
      routineRepository.softDeleteRoutines.mockResolvedValue();
      await routineRepository.softDeleteRoutines([]);

      expect(mockRoutineRepository.softDeleteRoutines).toHaveBeenCalledWith([]);
    });

    it('should not make error when given ids are not existed', async () => {
      const notExistRoutineIds = [10000, 99];

      routineRepository.softDeleteRoutines.mockResolvedValue();
      await expect(routineRepository.softDeleteRoutines(notExistRoutineIds)).resolves.not.toThrow();
      expect(routineRepository.softDeleteRoutines).toHaveBeenCalledWith(notExistRoutineIds);
    });
  });

  describe('findRoutineNameByUserIdLockMode', () => {
    let mockUser: User;
    let mockRoutine1: Routine;
    let mockRoutine2: Routine;

    beforeEach(async () => {
      mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      const routineName = '다리 루틴';

      mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '스모 데드리프트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine1.id = 1;

      mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine2.id = 2;
    });

    it('should find routines in the lock mode using user and routine name', async () => {
      const routineName = '아침 루틴';
      routineRepository.findRoutineNameByUserIdLockMode.mockResolvedValue([mockRoutine1]);

      const result = await routineRepository.findRoutineNameByUserIdLockMode(routineName, mockUser);

      expect(result).toEqual([mockRoutine1]);
      expect(routineRepository.findRoutineNameByUserIdLockMode).toHaveBeenCalledWith(routineName, mockUser);
    });

    it('should return empty array when user search using non existing routine name', async () => {
      const nonExistentRoutineName = '존재하지 않는 루틴';
      routineRepository.findRoutineNameByUserIdLockMode.mockResolvedValue([]);

      const result = await routineRepository.findRoutineNameByUserIdLockMode(nonExistentRoutineName, mockUser);

      expect(result).toEqual([]);
      expect(routineRepository.findRoutineNameByUserIdLockMode).toHaveBeenCalledWith(nonExistentRoutineName, mockUser);
    });
  });

  describe('findAllByUserId', () => {
    it('should return all routines using user id', async () => {
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      const routineName = '다리 루틴';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '스모 데드리프트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS }),
      });
      mockRoutine2.id = 2;
      routineRepository.findAllByUserId.mockResolvedValue([mockRoutine1, mockRoutine2]);

      const result = await routineRepository.findAllByUserId(1);

      expect(result).toEqual([mockRoutine1, mockRoutine2]);
      expect(mockRoutineRepository.findAllByUserId).toHaveBeenCalledWith(1);
    });
  });
});
