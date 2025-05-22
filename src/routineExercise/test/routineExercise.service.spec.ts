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

const mockExerciseService = {
  findNewExercises: jest.fn(),
  bulkInsertExercises: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
};

const mockRoutineExerciseRepository = {
  saveRoutineExercises: jest.fn(),
};

describe('RoutineExerciseService', () => {
  let service: RoutineExerciseService;
  let repository: jest.Mocked<typeof mockRoutineExerciseRepository>;
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

    service = module.get(RoutineExerciseService);
    repository = module.get(ROUTINE_EXERCISE_REPOSITORY);
    exerciseService = module.get(ExerciseService);
  });

  describe('saveRoutineExercises', () => {
    beforeEach(async () => {});

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

      repository.saveRoutineExercises.mockResolvedValue([
        new RoutineExercise({ routine: testRoutine, exercise: savedExercise, order: 1 }),
      ]);

      const result = await service.saveRoutineExercises(inputData);

      expect(result).toHaveLength(1);
      expect(result[0].order).toBe(1);
      expect(result[0].routineId).toBe(1); // testRoutine.id
      expect(result[0].routineName).toBe('testRoutine'); // testRoutine.name
      expect(result[0].exerciseId).toBe(1); //savedExercise.id
      expect(result[0].exerciseName).toBe('testLegExercise'); // savedExercise.exerciseName
      expect(result[0].exerciseBodyPart).toBe(BodyPart.LEGS); // savedExercise.bodyPart
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

      await expect(service.saveRoutineExercises(inputData)).rejects.toThrow(NotFoundException);
    });
  });
});
