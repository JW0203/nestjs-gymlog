import { ExerciseService } from '../../exercise/application/exercise.service';
import { UserService } from '../../user/application/user.service';
import { updateWorkoutLogsWithValidation, WorkoutLogService } from '../application/workoutLog.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WORKOUTLOG_REPOSITORY } from '../../common/const/inject.constant';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { BodyPart } from '../../common/bodyPart.enum';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { User } from '../../user/domain/User.entity';
import { WorkoutLog } from '../domain/WorkoutLog.entity';
import { WorkoutLogResponseDto } from '../dto/workoutLog.response.dto';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { getWorkoutLogByUserResponse } from '../dto/getWorkoutLogByUser.response.dto';
import { RedisService } from '../../cache/redis.service';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
  initializeTransactionalContext: jest.fn(),
}));

describe('WorkoutLogService', () => {
  let workoutLogService: WorkoutLogService;
  let userService: jest.Mocked<typeof mockUserService>;
  let exerciseService: jest.Mocked<typeof mockExerciseService>;
  let workoutLogRepository: jest.Mocked<typeof mockWorkoutLogRepository>;

  const mockUserService = {
    findOneById: jest.fn(),
  };
  const mockExerciseService = {
    findNewExercises: jest.fn(),
    bulkInsertExercises: jest.fn(),
    findExercisesByExerciseNameAndBodyPartLockMode: jest.fn(),
    findExercisesByExerciseNameAndBodyPart: jest.fn(),
  };

  const mockWorkoutLogRepository = {
    bulkInsertWorkoutLogs: jest.fn(),
    findWorkoutLogsByDay: jest.fn(),
    findWorkoutLogsByIdsLockMode: jest.fn(),
    bulkUpdateWorkoutLogs: jest.fn(),
    softDeleteWorkoutLogs: jest.fn(),
    findWorkoutLogsByUser: jest.fn(),
  };

  const mockRediService = {};

  beforeEach(async () => {
    console.log('Running beforeEach');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkoutLogService,
        { provide: UserService, useValue: mockUserService },
        { provide: ExerciseService, useValue: mockExerciseService },
        { provide: WORKOUTLOG_REPOSITORY, useValue: mockWorkoutLogRepository },
        { provide: RedisService, useValue: mockRediService },
      ],
    }).compile();

    workoutLogService = module.get<WorkoutLogService>(WorkoutLogService);
    userService = module.get<typeof mockUserService>(UserService);
    exerciseService = module.get<typeof mockExerciseService>(ExerciseService);
    workoutLogRepository = module.get<typeof mockWorkoutLogRepository>(WORKOUTLOG_REPOSITORY);
  });

  describe('bulkInsertWorkoutLogs', () => {
    it('Should throw NotFoundException when user can not be found using user id', async () => {
      const saveWorkoutLogs: SaveWorkoutLogsRequestDto = {
        workoutLogs: [
          {
            setCount: 1,
            weight: 30,
            repeatCount: 15,
            bodyPart: BodyPart.BACK,
            exerciseName: 'seated row',
          },
          {
            setCount: 2,
            weight: 35,
            repeatCount: 15,
            bodyPart: BodyPart.BACK,
            exerciseName: 'seated row',
          },
        ],
      };

      userService.findOneById.mockResolvedValue(null);

      await expect(workoutLogService.bulkInsertWorkoutLogs(1, saveWorkoutLogs)).rejects.toThrow(NotFoundException);
    });

    it('Should throw NotFoundException if exercise in workout can not be found from database', async () => {
      const user: User = new User({ nickName: 'test', password: 'password123', email: 'test@example.com' });
      user.id = 1;
      const saveWorkoutLogs: SaveWorkoutLogsRequestDto = {
        workoutLogs: [
          {
            setCount: 1,
            weight: 30,
            repeatCount: 15,
            bodyPart: BodyPart.LEGS,
            exerciseName: 'reg press',
          },
          {
            setCount: 2,
            weight: 35,
            repeatCount: 15,
            bodyPart: BodyPart.LEGS,
            exerciseName: 'reg press',
          },
        ],
      };

      const otherExercise = new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'T bar row' });

      userService.findOneById(user);
      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue(otherExercise);

      await expect(workoutLogService.bulkInsertWorkoutLogs(1, saveWorkoutLogs)).rejects.toThrow(NotFoundException);
    });

    it('Should save new workoutLogs at once', async () => {
      const user: User = new User({ nickName: 'test', password: 'password123', email: 'test@example.com' });
      user.id = 1;

      const saveWorkoutLogs: SaveWorkoutLogsRequestDto = {
        workoutLogs: [
          {
            setCount: 1,
            weight: 30,
            repeatCount: 15,
            bodyPart: BodyPart.LEGS,
            exerciseName: 'reg press',
          },
          {
            setCount: 2,
            weight: 35,
            repeatCount: 15,
            bodyPart: BodyPart.LEGS,
            exerciseName: 'reg press',
          },
        ],
      };

      const exercises = saveWorkoutLogs.workoutLogs.map(({ bodyPart, exerciseName }) => ({ bodyPart, exerciseName }));
      const workoutLogsEntities = saveWorkoutLogs.workoutLogs.map((workoutLog, i) => {
        const { exerciseName, bodyPart, setCount, weight, repeatCount } = workoutLog;
        const exercise = new Exercise({ bodyPart, exerciseName });
        const workoutLogEntity: WorkoutLog = new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
        });
        workoutLogEntity.id = i + 1;
        workoutLogEntity.createdAt = new Date();
        workoutLogEntity.updatedAt = new Date();
        return workoutLogEntity;
      });
      const expectedResult = workoutLogsEntities.map((workoutLog) => new WorkoutLogResponseDto(workoutLog));

      userService.findOneById.mockResolvedValue(user);
      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue(exercises);
      workoutLogRepository.bulkInsertWorkoutLogs.mockResolvedValue(workoutLogsEntities);

      const result = await workoutLogService.bulkInsertWorkoutLogs(user.id, saveWorkoutLogs);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getWorkoutLogsByDay', () => {
    it('Should throw NotFoundException if a user can not be found using id', async () => {
      userService.findOneById.mockResolvedValue(null);

      await expect(workoutLogService.getWorkoutLogsByDay('2024-12-06', 999)).rejects.toThrow(NotFoundException);
      expect(workoutLogRepository.findWorkoutLogsByDay).not.toHaveBeenCalled();
    });

    it('Should return empty array if no workout logs are found on the given date and a user', async () => {
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: 'password123' });
      user.id = 1;

      userService.findOneById.mockResolvedValue(user);
      workoutLogRepository.findWorkoutLogsByDay.mockResolvedValue([]);

      const result = await workoutLogService.getWorkoutLogsByDay('2024-12-06', 999);
      expect(result).toEqual([]);
      expect(workoutLogRepository.findWorkoutLogsByDay).toHaveBeenCalledWith('2024-12-06', 999);
    });

    it('Should return workout logs for given date and a user', async () => {
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: 'password123' });
      user.id = 1;
      const workoutLogs = [
        {
          setCount: 1,
          weight: 30,
          repeatCount: 15,
          bodyPart: BodyPart.LEGS,
          exerciseName: 'reg press',
        },
        {
          setCount: 2,
          weight: 35,
          repeatCount: 15,
          bodyPart: BodyPart.LEGS,
          exerciseName: 'reg press',
        },
      ];
      const workoutLogsEntity: WorkoutLog[] = workoutLogs.map((workoutLog, i) => {
        const { setCount, weight, repeatCount, bodyPart, exerciseName } = workoutLog;
        const exercise = new Exercise({ bodyPart, exerciseName });
        exercise.id = i + 1;

        const workoutLogEntity: WorkoutLog = new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
        });
        workoutLogEntity.id = i + 1;
        workoutLogEntity.createdAt = new Date('2024-12-06');
        workoutLogEntity.updatedAt = new Date('2024-12-06');
        return workoutLogEntity;
      });

      const expectedResult = workoutLogsEntity.map((workoutLog) => new WorkoutLogResponseDto(workoutLog));

      userService.findOneById.mockResolvedValue(user);
      workoutLogRepository.findWorkoutLogsByDay.mockResolvedValue(workoutLogsEntity);

      const result = await workoutLogService.getWorkoutLogsByDay('2024-12-06', 1);
      expect(result).toEqual(expectedResult);
      expect(userService.findOneById).toHaveBeenCalledWith(user.id);
      expect(workoutLogRepository.findWorkoutLogsByDay).toHaveBeenCalledWith('2024-12-06', 1);
    });
  });

  describe('bulkUpdateWorkoutLogs', () => {
    it('Should throw NotFoundException if user can not be found using user id', async () => {
      const updateWorkoutLogRequest: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge', id: 1 },
        ],
      };

      userService.findOneById.mockResolvedValue(null);

      await expect(workoutLogService.bulkUpdateWorkoutLogs(9999, updateWorkoutLogRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findOneById).toHaveBeenCalledWith(999);
    });

    it('Should throw NotFoundException if workout logs can not be found using given ids', async () => {
      const userId = 1;
      const workoutLogIds = [1];
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: 'password123' });
      user.id = userId;
      const updateWorkoutLogRequest: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
        ],
      };

      userService.findOneById.mockResolvedValue(user);
      workoutLogRepository.findWorkoutLogsByIdsLockMode.mockResolvedValue([]);

      await expect(workoutLogService.bulkUpdateWorkoutLogs(userId, updateWorkoutLogRequest)).rejects.toThrow(
        NotFoundException,
      );
      expect(userService.findOneById).toHaveBeenCalledWith(userId);
      expect(workoutLogRepository.findWorkoutLogsByIdsLockMode).toHaveBeenCalledWith(workoutLogIds, userId);
    });

    it('Should throw NotFoundException if exercises in workoutLogs can not be found in DB', async () => {
      const userId = 1;
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: 'password123' });
      user.id = userId;
      const updateWorkoutLogsRequest: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'reg press' },
          { id: 2, setCount: 2, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'reg press' },
        ],
      };

      const workoutLogEntities = updateWorkoutLogsRequest.updateWorkoutLogs.map((workoutLog, i) => {
        const { id, setCount, weight, repeatCount, bodyPart, exerciseName } = workoutLog;
        const exercise = new Exercise({ bodyPart, exerciseName });
        exercise.id = i + 1;
        const workoutLogEntity = new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
        });
        workoutLogEntity.id = id;
        return workoutLogEntity;
      });

      const otherExerciseEntity = [new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'arm pull down' })];

      userService.findOneById.mockResolvedValue(user);
      workoutLogRepository.findWorkoutLogsByIdsLockMode.mockResolvedValue(workoutLogEntities);
      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(otherExerciseEntity);

      await expect(workoutLogService.bulkUpdateWorkoutLogs(userId, updateWorkoutLogsRequest)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Should update workout logs with correct parameters', async () => {
      const userId = 1;
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: 'password123' });
      user.id = userId;
      const originWorkoutLogs = [
        { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
        { id: 2, setCount: 2, weight: 0, repeatCount: 20, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
      ];
      const changeRepeatCount = 15;
      const updateWorkoutLogsRequest: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          { id: 1, setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
          {
            id: 2,
            setCount: 2,
            weight: 0,
            repeatCount: changeRepeatCount,
            bodyPart: BodyPart.LEGS,
            exerciseName: 'lunge',
          },
        ],
      };
      const originWorkoutLogEntities = originWorkoutLogs.map((workoutLog, i) => {
        const { id, setCount, weight, repeatCount, bodyPart, exerciseName } = workoutLog;
        const exercise = new Exercise({ bodyPart, exerciseName });
        exercise.id = i + 1;

        const workoutLogEntity = new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
        });
        workoutLogEntity.id = id;
        workoutLogEntity.createdAt = new Date();
        workoutLogEntity.updatedAt = new Date();
        return workoutLogEntity;
      });

      const updatedWorkoutLogEntities = updateWorkoutLogsRequest.updateWorkoutLogs.map((workoutLog, i) => {
        const { id, setCount, weight, repeatCount, bodyPart, exerciseName } = workoutLog;
        const exercise = new Exercise({ bodyPart, exerciseName });
        exercise.id = i + 1;
        const workoutLogEntity = new WorkoutLog({
          setCount,
          weight,
          repeatCount,
          exercise,
          user,
        });
        workoutLogEntity.id = id;
        workoutLogEntity.createdAt = new Date();
        workoutLogEntity.updatedAt = new Date();
        return workoutLogEntity;
      });

      const exerciseEntity = [new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: 'lunge' })];
      const expectedResult = updatedWorkoutLogEntities.map((workoutLog) => {
        return new WorkoutLogResponseDto(workoutLog);
      });

      userService.findOneById.mockResolvedValue(user);
      workoutLogRepository.findWorkoutLogsByIdsLockMode.mockResolvedValue(originWorkoutLogEntities);
      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(exerciseEntity);
      workoutLogRepository.bulkUpdateWorkoutLogs.mockResolvedValue(updatedWorkoutLogEntities);

      const result = await workoutLogService.bulkUpdateWorkoutLogs(userId, updateWorkoutLogsRequest);
      expect(result).toEqual(expectedResult);
      expect(userService.findOneById).toHaveBeenCalledWith(userId);
      expect(workoutLogRepository.findWorkoutLogsByIdsLockMode).toHaveBeenCalledWith([1, 2], userId);
      const exercises = updateWorkoutLogsRequest.updateWorkoutLogs.map(({ bodyPart, exerciseName }) => ({
        bodyPart,
        exerciseName,
      }));
      expect(exerciseService.findNewExercises).toHaveBeenCalledWith({ exercises });
      expect(exerciseService.findExercisesByExerciseNameAndBodyPart).toHaveBeenCalledWith(exercises);

      const workoutLogMap = new Map(originWorkoutLogEntities.map((log) => [log.id, log]));
      const promisedUpdateWorkoutLogs = await updateWorkoutLogsWithValidation({
        workoutLogMap,
        foundExercises: exerciseEntity,
        user,
        updateWorkoutLogs: updateWorkoutLogsRequest.updateWorkoutLogs,
      });
      expect(workoutLogRepository.bulkUpdateWorkoutLogs).toHaveBeenCalledWith(promisedUpdateWorkoutLogs);
    });
  });

  describe('softDeleteWorkoutLogs', () => {
    it('should throw NotFoundException if workout logs can not be found using given ids', async () => {
      const softDeleteRequestDto = { ids: [1, 2, 3] };
      const user: User = new User({ email: 'test@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      workoutLogRepository.findWorkoutLogsByIdsLockMode.mockResolvedValue([]);

      await expect(workoutLogService.softDeleteWorkoutLogs(softDeleteRequestDto, user)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete workoutLogs based on workoutLog ids and user id', async () => {
      const softDeleteRequestDto = { ids: [1, 2] };
      const user: User = new User({ email: 'test@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      const workoutLogIds = [1, 2];
      const workoutLogs = [
        { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
        { setCount: 2, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
      ];
      const workoutLogEntities: WorkoutLog[] = workoutLogs.map(
        ({ setCount, weight, repeatCount, bodyPart, exerciseName }, i) => {
          const exercise = new Exercise({ bodyPart, exerciseName });
          exercise.id = i + 1;
          const workoutLogEntity = new WorkoutLog({
            setCount,
            weight,
            repeatCount,
            exercise,
            user,
          });
          workoutLogEntity.id = workoutLogIds[i];
          return workoutLogEntity;
        },
      );

      workoutLogRepository.findWorkoutLogsByIdsLockMode.mockResolvedValue(workoutLogEntities);
      workoutLogRepository.softDeleteWorkoutLogs.mockResolvedValue(undefined);

      const result = await workoutLogService.softDeleteWorkoutLogs(softDeleteRequestDto, user);

      expect(result).toEqual(undefined);
      expect(workoutLogRepository.findWorkoutLogsByIdsLockMode).toHaveBeenCalledWith(workoutLogIds, user.id);
      expect(workoutLogRepository.softDeleteWorkoutLogs).toHaveBeenCalledWith(workoutLogIds, user);
    });
  });

  describe('getAggregatedWorkoutLogsByUser', () => {
    it('should return all workoutLogs by users', async () => {
      const user: User = new User({ email: 'test@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;

      const workoutLogs = [
        { setCount: 1, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
        { setCount: 2, weight: 0, repeatCount: 15, bodyPart: BodyPart.LEGS, exerciseName: 'lunge' },
      ];
      const workoutLogEntities: WorkoutLog[] = workoutLogs.map(
        ({ setCount, weight, repeatCount, bodyPart, exerciseName }, i) => {
          const exercise = new Exercise({ bodyPart, exerciseName });
          exercise.id = i + 1;
          const workoutLogEntity = new WorkoutLog({
            setCount,
            weight,
            repeatCount,
            exercise,
            user,
          });
          workoutLogEntity.id = i + 1;
          return workoutLogEntity;
        },
      );

      const expectedResult: object = getWorkoutLogByUserResponse(workoutLogEntities);
      workoutLogRepository.findWorkoutLogsByUser.mockResolvedValue(workoutLogEntities);

      const result = await workoutLogService.getAggregatedWorkoutLogsByUser(user);
      expect(result).toEqual(expectedResult);
      expect(workoutLogRepository.findWorkoutLogsByUser).toHaveBeenCalledWith(user);
    });
  });
});
