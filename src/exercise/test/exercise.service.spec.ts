import { Test, TestingModule } from '@nestjs/testing';
import { EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseService } from '../application/exercise.service';
import { NotFoundException } from '@nestjs/common';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { Exercise } from '../domain/Exercise.entity';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';

const mockExerciseRepository = {
  findOneByExerciseNameAndBodyPart: jest.fn(),
  findAll: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
  findExercisesByExerciseNameAndBodyPartLockMode: jest.fn(),
  findNewExercises: jest.fn(),
  bulkInsertExercises: jest.fn(),
  bulkSoftDelete: jest.fn(),
};

describe('Test ExerciseService', () => {
  let service: ExerciseService;
  let mockRepository: typeof mockExerciseRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        {
          provide: EXERCISE_REPOSITORY,
          useValue: mockExerciseRepository,
        },
      ],
    }).compile();
    service = module.get<ExerciseService>(ExerciseService);
    mockRepository = module.get(EXERCISE_REPOSITORY);
  });
  it('service and mockRepository should be defined', () => {
    expect(service).toBeDefined();
    expect(mockRepository).toBeDefined();
  });

  describe('test findOneByExerciseNameAndBodyPart', () => {
    it('should return the exercise if found', async () => {
      const exerciseName = 'Squat';
      const bodyPart = BodyPart.SHOULDERS;
      const mockExercise = { id: 1, exerciseName, bodyPart };

      mockRepository.findOneByExerciseNameAndBodyPart.mockResolvedValue(mockExercise);

      const result = await service.findOneByExerciseNameAndBodyPart({ exerciseName, bodyPart: BodyPart.SHOULDERS });
      expect(result).toEqual(mockExercise);
    });

    it('should throw NotFoundException if exercise not found', async () => {
      mockRepository.findOneByExerciseNameAndBodyPart.mockResolvedValue(null);

      // 비동기 호출을 해결한 후 rejects 를 이용해여 Promise 가 거부되는 상황을 테스트 하기 위함
      await expect(
        service.findOneByExerciseNameAndBodyPart({
          exerciseName: 'NonExistingExercise',
          bodyPart: BodyPart.LEGS,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('test findAll', () => {
    it('should return all exercise if found', async () => {
      const mockExercises: Exercise[] = [
        new Exercise({ bodyPart: BodyPart.LEGS, exerciseName: 'Squat' }),
        new Exercise({ bodyPart: BodyPart.CHEST, exerciseName: 'Bench Press' }),
      ];
      mockRepository.findAll.mockResolvedValue(mockExercises);
      const result = await service.findAll();
      expect(result).toEqual(mockExercises.map((exercise) => new ExerciseDataResponseDto(exercise)));
    });

    it('should throw NotFoundException if no exercises are found', async () => {
      mockRepository.findAll.mockResolvedValue([]);

      await expect(service.findAll()).rejects.toThrow(new NotFoundException('No exercise data in Exercise entity'));
    });
  });

  describe('test findExercisesByExerciseNameAndBodyPart', () => {
    it('should return the exercises if found', async () => {
      const mockExercises: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.LEGS, exerciseName: 'Squat' },
        { bodyPart: BodyPart.CHEST, exerciseName: 'Bench Press' },
      ];
      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(mockExercises);

      const expectedExercises = mockExercises.map(
        (mockExercise) => new Exercise({ bodyPart: mockExercise.bodyPart, exerciseName: mockExercise.exerciseName }),
      );
      const result = await service.findExercisesByExerciseNameAndBodyPart(mockExercises);
      expect(result).toEqual(expectedExercises);
    });

    it('should throw NotFoundException if no exercises are found in the database', async () => {
      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([]);
      await expect(
        service.findExercisesByExerciseNameAndBodyPart([
          { bodyPart: BodyPart.LEGS, exerciseName: 'Squat' },
          { bodyPart: BodyPart.CHEST, exerciseName: 'Bench Press' },
        ]),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
