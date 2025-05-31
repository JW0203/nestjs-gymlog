import { Test } from '@nestjs/testing';
import { RoutineExerciseService } from '../application/routineExercise.service';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { User } from '../../user/domain/User.entity';
import { Routine } from '../../routine/domain/Routine.entity';
import { ExerciseService } from '../../exercise/application/exercise.service';
import { ROUTINE_EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { BodyPart } from '../../common/bodyPart.enum';
import { RoutineExercise } from '../domain/RoutineExercise.entity';
import { NotFoundException } from '@nestjs/common';
import { FindDataByRoutineIdRequestDto } from '../dto/findDataByRoutineId.request.dto';

const mockExerciseService = {
  findNewExercises: jest.fn(),
  bulkInsertExercises: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
};

const mockRoutineExerciseRepository = {
  saveRoutineExercises: jest.fn(),
  findRoutineExerciseByRoutineId: jest.fn(),
};

describe('RoutineExerciseService', () => {
  let routineExerciseService: RoutineExerciseService;
  let routineExerciseRepository: jest.Mocked<typeof mockRoutineExerciseRepository>;
  let exerciseService: jest.Mocked<typeof mockExerciseService>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoutineExerciseService,
        {
          provide: ExerciseService,
          useValue: mockExerciseService,
        },
        {
          provide: ROUTINE_EXERCISE_REPOSITORY,
          useValue: mockRoutineExerciseRepository,
        },
      ],
    }).compile();

    routineExerciseService = module.get(RoutineExerciseService);
    routineExerciseRepository = module.get(ROUTINE_EXERCISE_REPOSITORY);
    exerciseService = module.get(ExerciseService);
  });

  describe('saveRoutineExercises', () => {
    it('should return new RoutineExercises if RoutineExercises have been saved', async () => {
      const testUser = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      testUser.id = 1;

      const testRoutine = new Routine({ name: 'testRoutine', user: testUser });
      testRoutine.id = 1;

      const inputExercise = new Exercise({ exerciseName: 'testLegExercise', bodyPart: BodyPart.LEGS });
      const savedExercise = new Exercise({ exerciseName: 'testLegExercise', bodyPart: BodyPart.LEGS });
      savedExercise.id = 1;

      const inputData = [
        {
          order: 1,
          routine: testRoutine,
          exercise: inputExercise,
        },
      ];

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([savedExercise]);

      routineExerciseRepository.saveRoutineExercises.mockResolvedValue([
        new RoutineExercise({ routine: testRoutine, exercise: savedExercise, order: 1 }),
      ]);

      const result = await routineExerciseService.saveRoutineExercises(inputData);

      expect(result.routineId).toBe(1);
      expect(result.routineName).toBe('testRoutine');
      expect(result.routines[0].order).toBe(1);
      expect(result.routines[0].exerciseId).toBe(1);
      expect(result.routines[0].exerciseName).toBe('testLegExercise');
      expect(result.routines[0].bodyPart).toBe(BodyPart.LEGS);
    });

    it('should throw NotFoundException if exercise cannot be found after insert', async () => {
      const testUser = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      testUser.id = 1;

      const testRoutine = new Routine({ name: 'testRoutine', user: testUser });
      testRoutine.id = 1;

      const inputExercise = new Exercise({ exerciseName: 'testLegExercise', bodyPart: BodyPart.LEGS });

      const inputData = [
        {
          order: 1,
          routine: testRoutine,
          exercise: inputExercise,
        },
      ];

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([]);

      await expect(routineExerciseService.saveRoutineExercises(inputData)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findRoutineExercisesByRoutineId', () => {
    it('should return routineExercises associated with a given routine ID', async () => {
      const testUser = new User({ email: 'newuser@email.com', password: '12345678', nickName: 'tester' });
      testUser.id = 1;
      const testRoutine = new Routine({ name: 'testRoutine', user: testUser });
      testRoutine.id = 1;
      const inputExercise1 = new Exercise({ exerciseName: 'testLegExercise', bodyPart: BodyPart.LEGS });
      const inputExercise2 = new Exercise({ exerciseName: 'testLegExercise2', bodyPart: BodyPart.LEGS });

      exerciseService.findNewExercises.mockResolvedValue([]);
      exerciseService.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([inputExercise1, inputExercise2]);

      routineExerciseRepository.saveRoutineExercises.mockResolvedValue([
        new RoutineExercise({ routine: testRoutine, exercise: inputExercise1, order: 1 }),
        new RoutineExercise({ routine: testRoutine, exercise: inputExercise2, order: 2 }),
      ]);
      routineExerciseRepository.findRoutineExerciseByRoutineId.mockResolvedValue([
        new RoutineExercise({ routine: testRoutine, exercise: inputExercise1, order: 1 }),
        new RoutineExercise({ routine: testRoutine, exercise: inputExercise2, order: 2 }),
      ]);

      const requestDataByRoutineId = new FindDataByRoutineIdRequestDto(1);

      const result = await routineExerciseService.findRoutineExercisesByRoutineId(requestDataByRoutineId);

      expect(result.routineId).toBe(1);
      expect(result.routineName).toBe('testRoutine');
      expect(result.routines).toHaveLength(2);
    });

    it('should return NotFoundException when the routineExercise not found using a given routine ID', async () => {
      routineExerciseRepository.findRoutineExerciseByRoutineId.mockResolvedValue([]);
      await expect(routineExerciseService.findRoutineExercisesByRoutineId({ id: 999 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
