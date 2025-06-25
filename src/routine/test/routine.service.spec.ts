import { Test, TestingModule } from '@nestjs/testing';
import { RoutineService } from '../application/routine.service';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { BodyPart } from '../../common/bodyPart.enum';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { Routine } from '../domain/Routine.entity';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';
import { SaveRoutineResponseDto } from '../dto/saveRoutine.response.dto';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SoftDeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { RoutineExercise } from '../../routineExercise/domain/RoutineExercise.entity';
import { RoutineExerciseService } from '../../routineExercise/application/routineExercise.service';
import { UpdateRoutine } from '../dto/updateRoutine.dto';
import { FindDataByRoutineIdResponseDto } from '../../routineExercise/dto/fineDataByRoutineId.response.dto';

const mockRoutineRepository = {
  findOneRoutineByName: jest.fn(),
  findOneRoutineById: jest.fn(),
  findRoutinesByIds: jest.fn(),
  updateRoutine: jest.fn(),
  softDeleteRoutines: jest.fn(),
  findAllByUserId: jest.fn(),
  saveRoutine: jest.fn(),
};

const mockRoutineExerciseService = {
  saveRoutineExercises: jest.fn(),
  findRoutineExercisesByRoutineId: jest.fn(),
  updateRoutineExercise: jest.fn(),
  findAllRoutineExercisesByRoutineIds: jest.fn(),
  softDeleteRoutineExercises: jest.fn(),
};

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
  initializeTransactionalContext: jest.fn(),
}));

describe('Test RoutineService', () => {
  let routineService: RoutineService;
  let routineRepository: jest.Mocked<typeof mockRoutineRepository>;
  let routineExerciseService: jest.Mocked<typeof mockRoutineExerciseService>;

  beforeAll(async () => {
    initializeTransactionalContext();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutineService,
        {
          provide: ROUTINE_REPOSITORY,
          useValue: mockRoutineRepository,
        },
        {
          provide: RoutineExerciseService,
          useValue: mockRoutineExerciseService,
        },
      ],
    }).compile();

    routineService = module.get<RoutineService>(RoutineService);
    routineRepository = module.get(ROUTINE_REPOSITORY);
    routineExerciseService = module.get(RoutineExerciseService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('saveRoutine', () => {
    it('should return a new routine if a routine is saved', async () => {
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      const routineName: string = 'Chest Day';

      const newRoutine: Routine = new Routine({ name: routineName, user });
      newRoutine.id = 1;

      const orderAndExercise = [
        {
          order: 1,
          bodyPart: BodyPart.BACK,
          exerciseName: 'dead lift',
        },
      ];

      const saveRoutineRequest: SaveRoutineRequestDto = { routineName, orderAndExercise };

      const exercise = new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'dead lift' });
      const newRoutineExercise = new RoutineExercise({ order: 1, routine: newRoutine, exercise });
      exercise.id = 1;

      const expectedResult = SaveRoutineResponseDto.fromEntities([newRoutineExercise]);
      routineRepository.findOneRoutineByName.mockResolvedValue(null);
      routineRepository.saveRoutine.mockResolvedValue(newRoutine);
      routineExerciseService.saveRoutineExercises.mockResolvedValue(expectedResult);

      const result: SaveRoutineResponseDto = await routineService.saveRoutine(saveRoutineRequest, user);

      expect(result).toEqual(expectedResult);
      expect(routineRepository.findOneRoutineByName).toHaveBeenCalledWith(routineName, user);
      expect(routineRepository.saveRoutine).toHaveBeenCalledWith({ name: routineName, user });
      expect(routineExerciseService.saveRoutineExercises).toHaveBeenCalledWith([
        expect.objectContaining({
          order: 1,
          exercise: expect.objectContaining({ exerciseName: 'dead lift', bodyPart: BodyPart.BACK }),
          routine: newRoutine,
        }),
      ]);
      expect(result.routineId).toBe(1);
      expect(result.routineName).toBe('Chest Day');
      expect(result.routines[0].order).toBe(1);
      expect(result.routines[0].exerciseName).toBe('dead lift');
      expect(result.routines[0].bodyPart).toBe(BodyPart.BACK);
    });

    it('should throw BadRequestException if the routine name is already used', async () => {
      const user = new User({ email: 'used@email.com', password: '12345678', nickName: 'tester' });
      const routineName = 'AlreadyUsedRoutine';
      const routine = new Routine({ name: routineName, user });
      const saveRoutineRequest: SaveRoutineRequestDto = {
        routineName,
        orderAndExercise: [],
      };

      routineRepository.findOneRoutineByName.mockResolvedValue(routine);

      await expect(routineService.saveRoutine(saveRoutineRequest, user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRoutineByName', () => {
    it('should return the routine when searching by the name of a routine registered by the user', async () => {
      const routineNameDto: GetRoutineByNameRequestDto = { name: 'Back routine' };
      const routineName = routineNameDto.name;
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      const routine = new Routine({ name: routineName, user });
      routine.id = 1;

      const exercise = new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'dead lift' });
      const newRoutineExercise = new RoutineExercise({ order: 1, routine: routine, exercise });
      exercise.id = 1;

      const expectedResult = SaveRoutineResponseDto.fromEntities([newRoutineExercise]);

      routineRepository.findOneRoutineByName.mockResolvedValue(routine);
      routineExerciseService.findRoutineExercisesByRoutineId.mockResolvedValue(expectedResult);
      const result = await routineService.getRoutineByName({ name: routineName }, user);

      expect(result).toEqual(expectedResult);
      expect(routineRepository.findOneRoutineByName).toHaveBeenCalledWith(routineName, user);
      expect(routineExerciseService.findRoutineExercisesByRoutineId).toHaveBeenCalledWith({ id: 1 });
    });

    it('should return an empty array when searching for a routine not registered by the user', async () => {
      const routineNameDto = { name: 'non-existent-name' };
      const name: string = routineNameDto.name;
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      routineRepository.findOneRoutineByName.mockResolvedValue(null);

      await expect(routineService.getRoutineByName({ name }, user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRoutine', () => {
    it('should return a updated routine when routine name and exercises are updated', async () => {
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      const routineName: string = 'hamstring set';
      const routine = new Routine({ name: routineName, user });
      routine.id = 1;

      const updateData: UpdateRoutine[] = [
        {
          order: 1,
          exerciseName: 'leg press',
          bodyPart: BodyPart.LEGS,
        },
        {
          order: 2,
          exerciseName: 'goblet squat',
          bodyPart: BodyPart.LEGS,
        },
      ];

      const updateRoutineRequest: UpdateRoutinesRequestDto = {
        routineId: 1,
        routineName,
        updateData,
      };
      const exercisesInRoutine = [
        {
          id: 1,
          order: 1,
          exerciseId: 1,
          exerciseName: 'leg press',
          bodyPart: BodyPart.LEGS,
        },
        {
          id: 2,
          order: 2,
          exerciseId: 2,
          exerciseName: 'goblet squat',
          bodyPart: BodyPart.LEGS,
        },
      ];

      routineRepository.findOneRoutineById.mockResolvedValue(routine);
      routineExerciseService.updateRoutineExercise.mockResolvedValue({
        type: 'EXERCISE_UPDATED',
        data: { routineId: 1, routineName, routines: exercisesInRoutine },
      });

      routineRepository.updateRoutine.mockResolvedValue({
        updated: { routineId: 1, routineName, routines: exercisesInRoutine },
      });

      const result = await routineService.updateRoutine(updateRoutineRequest, user);

      expect(result).toEqual({ updated: { routineId: 1, routineName, routines: exercisesInRoutine } });
      expect(routineRepository.findOneRoutineById).toHaveBeenCalledWith(1, user);
      expect(routineExerciseService.updateRoutineExercise).toHaveBeenCalledWith(routine, updateData);
    });

    it('should return a updated routine when only routine name is updated', async () => {
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      const routineName: string = 'update name';
      const routine = new Routine({ name: routineName, user });
      routine.id = 1;

      const updateData: UpdateRoutine[] = [
        {
          order: 1,
          exerciseName: 'leg press',
          bodyPart: BodyPart.LEGS,
        },
        {
          order: 2,
          exerciseName: 'goblet squat',
          bodyPart: BodyPart.LEGS,
        },
      ];

      const updateRoutineRequest: UpdateRoutinesRequestDto = {
        routineId: 1,
        routineName,
        updateData,
      };
      const exercisesInRoutine = [
        {
          order: 1,
          exerciseName: 'leg press',
          bodyPart: BodyPart.LEGS,
        },
        {
          order: 2,
          exerciseName: 'goblet squat',
          bodyPart: BodyPart.LEGS,
        },
      ];

      const foundRoutine = new Routine({ name: 'current name', user });
      foundRoutine.id = 1;

      routineRepository.findOneRoutineById.mockResolvedValue(foundRoutine);
      routineRepository.saveRoutine.mockResolvedValue(routine);
      routineExerciseService.updateRoutineExercise.mockResolvedValue({
        type: 'EXERCISE_NOT_UPDATED',
      });
      routineRepository.updateRoutine.mockResolvedValue({
        updated: { routineId: 1, routineName: 'update name', routines: exercisesInRoutine },
      });

      const result = await routineService.updateRoutine(updateRoutineRequest, user);

      expect(result).toEqual({
        updated: { routineId: 1, routineName, routines: exercisesInRoutine },
      });
      expect(routineRepository.findOneRoutineById).toHaveBeenCalledWith(1, user);
      expect(routineExerciseService.updateRoutineExercise).toHaveBeenCalledWith(routine, updateData);
    });

    it('should handle routine not found during update', async () => {
      const user: User = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;
      const routineName: string = 'hamstring set';
      const updateRoutineRequest: UpdateRoutinesRequestDto = {
        routineId: 1,
        routineName,
        updateData: [
          {
            order: 1,
            exerciseName: 'leg press',
            bodyPart: BodyPart.LEGS,
          },
          {
            order: 2,
            exerciseName: 'goblet squat',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };
      routineRepository.findOneRoutineById.mockResolvedValue(null);

      await expect(routineService.updateRoutine(updateRoutineRequest, user)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteRoutines', () => {
    it('should return no content if routines are deleted', async () => {
      const user = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;

      const routineIds = [1, 2];
      const request = new SoftDeleteRoutineRequestDto(routineIds);

      const routineName = '하체 루틴';

      const routine1 = new Routine({
        name: routineName,
        user,
      });
      routine1.id = 1;

      const routine2 = new Routine({
        name: routineName,
        user,
      });
      routine2.id = 2;

      routineRepository.findRoutinesByIds.mockResolvedValue([routine1, routine2]);
      routineRepository.softDeleteRoutines.mockResolvedValue([]);
      routineExerciseService.softDeleteRoutineExercises.mockResolvedValue(undefined);

      const result = await routineService.softDeleteRoutines(request, user);

      expect(result).toEqual(undefined);
      expect(routineRepository.findRoutinesByIds).toHaveBeenCalledWith(routineIds, user);
      expect(routineRepository.softDeleteRoutines).toHaveBeenCalledWith([1, 2]);
    });

    it('should do nothing when no routines found', async () => {
      const routineIds: SoftDeleteRoutineRequestDto = { ids: [1, 2] };
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      mockUser.id = 1;

      routineRepository.findRoutinesByIds.mockResolvedValue([]);
      const result = await routineService.softDeleteRoutines(routineIds, mockUser);
      expect(result).toBeUndefined();
    });
  });

  describe('getAllRoutinesByUser', () => {
    it('should return all routines', async () => {
      const user = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;

      const routine1 = new Routine({
        name: 'Leg routine',
        user,
      });
      routine1.id = 1;

      const routine2 = new Routine({
        name: 'Back routine',
        user,
      });
      routine2.id = 2;

      const routineExercise1 = {
        routineId: 1,
        routineName: 'Leg routine',
        routines: [
          {
            order: 1,
            exerciseName: 'leg press',
            bodyPart: BodyPart.LEGS,
          },
          {
            order: 2,
            exerciseName: 'goblet squat',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };

      const routineExercise2 = {
        routineId: 2,
        routineName: 'Back routine',
        routines: [
          {
            order: 1,
            exerciseName: 'pulldown',
            bodyPart: BodyPart.BACK,
          },
          {
            order: 2,
            exerciseName: 'seated row machine',
            bodyPart: BodyPart.BACK,
          },
        ],
      };

      routineRepository.findAllByUserId.mockResolvedValue([routine1, routine2]);
      routineExerciseService.findAllRoutineExercisesByRoutineIds.mockResolvedValue([
        routineExercise1,
        routineExercise2,
      ]);

      const result = await routineService.getAllRoutinesByUser(user);
      expect(result[0].routineName).toBe('Leg routine');
      expect(result[1].routineName).toBe('Back routine');
    });

    it('should return empty array, when a logged in user has no routine', async () => {
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      mockUser.id = 1;
      routineRepository.findAllByUserId.mockResolvedValue([]);
      const result = await routineService.getAllRoutinesByUser(mockUser);
      expect(result).toEqual([]);
      expect(routineRepository.findAllByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('findAllRoutinesByUserId', () => {
    it('should return all routines', async () => {
      const user = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 1;

      const routine1 = new Routine({
        name: 'Leg routine',
        user: user,
      });
      routine1.id = 1;

      const routine2 = new Routine({
        name: 'Back routine',
        user: user,
      });
      routine2.id = 2;
      const routineExercise1 = {
        routineId: 1,
        routineName: 'Leg routine',
        routines: [
          {
            id: 1,
            order: 1,
            exerciseName: 'leg press',
            bodyPart: BodyPart.LEGS,
          },
          {
            id: 2,
            order: 2,
            exerciseName: 'goblet squat',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };

      const routineExercise2 = {
        routineId: 2,
        routineName: 'Back routine',
        routines: [
          {
            id: 3,
            order: 1,
            exerciseName: 'pulldown',
            bodyPart: BodyPart.BACK,
          },
          {
            id: 4,
            order: 2,
            exerciseName: 'seated row machine',
            bodyPart: BodyPart.BACK,
          },
        ],
      };
      routineRepository.findAllByUserId.mockResolvedValue([routine1, routine2]);
      routineExerciseService.findAllRoutineExercisesByRoutineIds.mockResolvedValue([
        routineExercise1,
        routineExercise2,
      ]);
      const result: FindDataByRoutineIdResponseDto[] = await routineService.getAllRoutinesByUser(user);

      const expectResult: FindDataByRoutineIdResponseDto[] = [routineExercise1, routineExercise2].map(
        ({ routineId, routines, routineName }) =>
          new FindDataByRoutineIdResponseDto({ routineName, routineId, routines }),
      );

      expect(result).toEqual(expectResult);
      expect(routineExerciseService.findAllRoutineExercisesByRoutineIds).toHaveBeenCalledWith({ ids: [1, 2] });
      expect(routineRepository.findAllByUserId).toHaveBeenCalledWith(1);
    });

    it('should return empty array, when a logged in user has no routine', async () => {
      const user = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      user.id = 2;

      routineRepository.findAllByUserId.mockResolvedValue([]);
      const result: FindDataByRoutineIdResponseDto[] = await routineService.getAllRoutinesByUser(user);
      expect(result).toEqual([]);
      expect(routineRepository.findAllByUserId).toHaveBeenCalledWith(2);
    });
  });
});
