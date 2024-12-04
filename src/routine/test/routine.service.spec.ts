import { Test, TestingModule } from '@nestjs/testing';
import { RoutineService } from '../application/routine.service';
import { ROUTINE_REPOSITORY } from '../../common/const/inject.constant';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { BodyPart } from '../../common/bodyPart.enum';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { SaveRoutineFormatDto } from '../dto/saveRoutine.format.dto';
import { User } from '../../user/domain/User.entity';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { Routine } from '../domain/Routine.entity';
import { RoutineResponseDto } from '../dto/routine.response.dto';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';

const mockRoutineRepository = {
  findRoutineNameByUserIdLockMode: jest.fn(),
  bulkInsertRoutines: jest.fn(),
  findRoutinesByName: jest.fn(),
  findOneRoutineById: jest.fn(),
  bulkUpdateRoutines: jest.fn(),
  findRoutinesByIds: jest.fn(),
  softDeleteRoutines: jest.fn(),
  findAllByUserId: jest.fn(),
};

const mockExerciseService = {
  findNewExercises: jest.fn(),
  bulkInsertExercises: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
};

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
  initializeTransactionalContext: jest.fn(),
}));

describe('Test RoutineService', () => {
  let routineService: RoutineService;
  let routineRepository: jest.Mocked<typeof mockRoutineRepository>;
  let exerciseService: jest.Mocked<typeof mockExerciseService>;

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
          provide: ExerciseService,
          useValue: mockExerciseService,
        },
      ],
    }).compile();

    routineService = module.get<RoutineService>(RoutineService);
    routineRepository = module.get(ROUTINE_REPOSITORY);
    exerciseService = module.get(ExerciseService);
  });

  describe('bulkInsertRoutines service', () => {
    it('should return new routines if routines are saved', async () => {
      const routineName: string = '등데이';
      const exercises: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.BACK, exerciseName: '케이블 암 풀다운' },
        { bodyPart: BodyPart.BACK, exerciseName: '어시스트 풀업 머신' },
      ];
      const routines: SaveRoutineFormatDto[] = [
        {
          routineName,
          exerciseName: '케이블 암 풀다운',
          bodyPart: BodyPart.BACK,
        },
        {
          routineName,
          exerciseName: '어시스트 풀업 머신',
          bodyPart: BodyPart.BACK,
        },
      ];

      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      const routinesData: SaveRoutinesRequestDto = { routines };
      const newRoutines = routines.map(
        (routine) =>
          new Routine({
            name: routine.routineName,
            user: mockUser,
            exercise: new Exercise({ bodyPart: routine.bodyPart, exerciseName: routine.exerciseName }),
          }),
      );

      const mockExercises = exercises.map(
        (ex) => new Exercise({ bodyPart: ex.bodyPart, exerciseName: ex.exerciseName }),
      );
      const expectedRoutineData = newRoutines.map((routine) => new RoutineResponseDto(routine));

      routineRepository.findRoutineNameByUserIdLockMode.mockResolvedValue([]);
      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(mockExercises);
      routineRepository.bulkInsertRoutines.mockResolvedValue(newRoutines);

      const result = await routineService.bulkInsertRoutines(mockUser, routinesData);
      expect(result).toEqual(expectedRoutineData);
    });
  });

  describe('getRoutineByName service', () => {
    it('should return the routine when searching by the name of a routine registered by the user', async () => {
      const routineNameDto: GetRoutineByNameRequestDto = { name: '등데이' };
      const routineName = routineNameDto.name;

      const routines: SaveRoutineFormatDto[] = [
        {
          routineName,
          exerciseName: '케이블 암 풀다운',
          bodyPart: BodyPart.BACK,
        },
        {
          routineName,
          exerciseName: '어시스트 풀업 머신',
          bodyPart: BodyPart.BACK,
        },
      ];

      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      const newRoutines = routines.map(
        (routine) =>
          new Routine({
            name: routine.routineName,
            user: mockUser,
            exercise: new Exercise({ bodyPart: routine.bodyPart, exerciseName: routine.exerciseName }),
          }),
      );

      const expectedRoutineData = newRoutines.map((routine) => new RoutineResponseDto(routine));

      routineRepository.findRoutinesByName.mockResolvedValue(newRoutines);

      const result = await routineService.getRoutineByName({ name: routineName }, mockUser);

      expect(result).toEqual(expectedRoutineData);
    });

    it('should return an empty array when searching for a routine not registered by the user', async () => {
      const routineNameDto = { name: 'non-existent-name' };
      const name: string = routineNameDto.name;
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      routineRepository.findRoutinesByName.mockResolvedValue([]);

      await expect(routineService.getRoutineByName({ name }, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkUpdateRoutines service', () => {
    it('should return a updated routine if the routine is updated', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName: string = '하체 뒤';

      const mockExercise1 = new Exercise({ exerciseName: '레그 프레스', bodyPart: BodyPart.LEGS });
      mockExercise1.id = 1;
      const mockExercise2 = new Exercise({ exerciseName: '고블린 스쿼트', bodyPart: BodyPart.LEGS });
      mockExercise2.id = 2;

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

      const updateRoutineRequest: UpdateRoutinesRequestDto = {
        updateData: [
          {
            id: 1,
            routineName: '업데이트 등 루틴',
            exerciseName: '레그 프레스',
            bodyPart: BodyPart.LEGS,
          },
          {
            id: 2,
            routineName: '업데이트 등 루틴',
            exerciseName: '고블린 스쿼트',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([mockExercise1, mockExercise2]);

      routineRepository.findOneRoutineById.mockImplementation((id: number) => {
        if (id === 1) return Promise.resolve(mockRoutine1);
        if (id === 2) return Promise.resolve(mockRoutine2);
        return Promise.resolve(null);
      });
      routineRepository.bulkUpdateRoutines.mockResolvedValue([mockRoutine1, mockRoutine2]);
      routineRepository.findRoutinesByIds.mockResolvedValue([mockRoutine1, mockRoutine2]);

      const result = await routineService.bulkUpdateRoutines(updateRoutineRequest, mockUser);

      const expectedResult: RoutineResponseDto[] = [mockRoutine1, mockRoutine2].map((r) => new RoutineResponseDto(r));

      expect(result).toHaveLength(2);
      expect(mockRoutine1.name).toBe('업데이트 등 루틴');
      expect(mockRoutine1.exercise).toBe(mockExercise1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle routine not found during update', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      const mockExercise: Exercise = new Exercise({ exerciseName: '레그 프레스', bodyPart: BodyPart.LEGS });
      const updateRoutinesDto: UpdateRoutinesRequestDto = {
        updateData: [
          {
            id: 999, // 존재하지 않는 ID
            routineName: 'Non-existent Routine',
            exerciseName: '레그 프레스',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([mockExercise]);
      routineRepository.findOneRoutineById.mockResolvedValue(null);

      await expect(routineService.bulkUpdateRoutines(updateRoutinesDto, mockUser)).rejects.toThrow(
        new BadRequestException('Routine with id 999 not found.'),
      );
    });

    it('should handle exercise not found during update', async () => {
      const mockUser: User = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const updateRoutinesDto: UpdateRoutinesRequestDto = {
        updateData: [
          {
            id: 1,
            routineName: 'Non-existent Routine',
            exerciseName: '레그 프레스',
            bodyPart: BodyPart.LEGS,
          },
        ],
      };

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([]);
      routineRepository.findOneRoutineById.mockResolvedValue(null);

      await expect(routineService.bulkUpdateRoutines(updateRoutinesDto, mockUser)).rejects.toThrow(
        new NotFoundException('exercises can not found'),
      );
    });
  });

  describe('Test softDeleteRoutines', () => {
    it('should return no content if routines are deleted', async () => {
      const mockRoutineIds: DeleteRoutineRequestDto = { ids: [1, 2] };
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName = '하체 루틴';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: '레그 프레스' }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: '고블린 스쿼트' }),
      });
      mockRoutine2.id = 2;

      routineRepository.findRoutinesByIds.mockResolvedValue([mockRoutine1, mockRoutine2]);
      routineRepository.softDeleteRoutines.mockResolvedValue(undefined);

      const result = await routineService.softDeleteRoutines(mockRoutineIds, mockUser);

      expect(result).toEqual(undefined);
      expect(routineRepository.findRoutinesByIds).toHaveBeenCalledWith([1, 2], mockUser);
      expect(routineRepository.softDeleteRoutines).toHaveBeenCalledWith([1, 2]);
    });

    it('should throw BadRequestException when no routines found', async () => {
      const mockRoutineIds: DeleteRoutineRequestDto = { ids: [1, 2] };
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      routineRepository.findRoutinesByIds.mockResolvedValue([]);
      await expect(routineService.softDeleteRoutines(mockRoutineIds, mockUser)).rejects.toThrow(
        new BadRequestException('Routines not found'),
      );
    });
  });

  describe('Test getAllRoutinesByUser', () => {
    it('should return all routines', async () => {
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;

      const routineName = '하체 루틴';

      const mockRoutine1 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: '레그 프레스' }),
      });
      mockRoutine1.id = 1;

      const mockRoutine2 = new Routine({
        name: routineName,
        user: mockUser,
        exercise: new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: '고블린 스쿼트' }),
      });
      mockRoutine2.id = 2;

      routineRepository.findAllByUserId.mockResolvedValue([mockRoutine1, mockRoutine2]);
      const result = await routineService.getAllRoutinesByUser(mockUser);
      expect(result[0].exercises).toHaveLength(2);
      expect(result[0].name).toBe(routineName);
    });

    it('should return empty array, when a logged in user has no routine', async () => {
      const mockUser = new User({ email: 'newuser@email.com', password: '12345678', name: 'tester' });
      mockUser.id = 1;
      routineRepository.findAllByUserId.mockResolvedValue([]);
      const result = await routineService.getAllRoutinesByUser(mockUser);
      expect(result).toEqual([]);
      expect(routineRepository.findAllByUserId).toHaveBeenCalledWith(mockUser.id);
    });
  });
});
