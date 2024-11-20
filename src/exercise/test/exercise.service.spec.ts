import { Test, TestingModule } from '@nestjs/testing';
import { EXERCISE_REPOSITORY } from '../../common/const/inject.constant';
import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseService } from '../application/exercise.service';
import { BadRequestException, ConflictException, INestApplication, NotFoundException } from '@nestjs/common';
import { ExerciseDataResponseDto } from '../../common/dto/exerciseData.response.dto';
import { Exercise } from '../domain/Exercise.entity';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { LockConfigManager } from '../../common/infrastructure/typeormMysql.lock';
import { ExerciseRepository } from '../domain/exercise.repository';
import { GetExercisesRequestDto } from '../dto/getExercises.request.dto';
import { FilteredExerciseDto } from '../dto/filteredExercise.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { AppModule } from '../../app.module';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';

const mockExerciseRepository: jest.Mocked<ExerciseRepository> = {
  findOneByExerciseNameAndBodyPart: jest.fn(),
  findAll: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
  findExercisesByExerciseNameAndBodyPartLockMode: jest.fn(),
  bulkInsertExercises: jest.fn(),
  bulkSoftDelete: jest.fn(),
  findExercisesByIds: jest.fn(),
};

describe('Test ExerciseService', () => {
  let service: ExerciseService;
  let mockRepository: typeof mockExerciseRepository;
  let dataSource: DataSource;
  let app: INestApplication;

  beforeAll(async () => {
    // 트랜잭션 컨텍스트 초기화
    initializeTransactionalContext();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EXERCISE_REPOSITORY)
      .useValue(mockExerciseRepository)
      .compile();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    await dataSource.dropDatabase();
    await dataSource.synchronize();

    app = moduleFixture.createNestApplication();
    await app.init();

    service = moduleFixture.get<ExerciseService>(ExerciseService);
    mockRepository = moduleFixture.get(EXERCISE_REPOSITORY);
  });

  it('service and mockRepository should be defined', () => {
    expect(service).toBeDefined();
    expect(mockRepository).toBeDefined();
  });

  describe('test findOneByExerciseNameAndBodyPart', () => {
    it('should return the exercise if found', async () => {
      const exerciseName: string = 'Squat';
      const bodyPart: BodyPart = BodyPart.SHOULDERS;
      const mockExercise = new Exercise({ exerciseName, bodyPart });

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
      const expectedExercisesData = mockExercises.map(
        (mockExercise) => new Exercise({ bodyPart: mockExercise.bodyPart, exerciseName: mockExercise.exerciseName }),
      );

      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(expectedExercisesData);

      const result = await service.findExercisesByExerciseNameAndBodyPart(mockExercises);
      expect(result).toEqual(expectedExercisesData);
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

  describe('test findExercisesByExerciseNameAndBodyPartLockMode', () => {
    it('should return exercises with the correct lock mode', async () => {
      const mockExercises: ExerciseDataFormatDto[] = [
        { bodyPart: BodyPart.LEGS, exerciseName: 'Squat' },
        { bodyPart: BodyPart.CHEST, exerciseName: 'Bench Press' },
      ];

      const expectedExercisesData = mockExercises.map(
        (mockExercise) => new Exercise({ bodyPart: mockExercise.bodyPart, exerciseName: mockExercise.exerciseName }),
      );

      const lockMode = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });
      mockRepository.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue(expectedExercisesData);

      const result = await service.findExercisesByExerciseNameAndBodyPartLockMode(mockExercises);
      expect(lockMode).toBeDefined();
      expect(result).toEqual(mockExercises);
    });
  });

  describe('test findNewExercises', () => {
    it('should return all exercises if none are found in the database', async () => {
      const getExercisesRequest: GetExercisesRequestDto = {
        exercises: [
          { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
          { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
        ],
      };
      const { exercises } = getExercisesRequest;

      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue([]);

      const result = await service.findNewExercises(getExercisesRequest);
      const expectedResult = exercises.map((exercise) => new FilteredExerciseDto(exercise));
      expect(result).toEqual(expectedResult);
    });
    it('should return only new exercises that are not already in the repository', async () => {
      const getExercisesRequest: GetExercisesRequestDto = {
        exercises: [
          { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
          { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
          { exerciseName: 'Dead lift', bodyPart: BodyPart.BACK },
        ],
      };
      const foundExercises = [
        new Exercise({ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }),
        new Exercise({ exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST }),
      ];

      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(foundExercises);

      const result = await service.findNewExercises(getExercisesRequest);
      const existingMap = new Map(foundExercises.map((ex) => [ex.bodyPart + ex.exerciseName, ex]));
      const newExercises = getExercisesRequest.exercises.filter(
        (ex) => !existingMap.has(ex.bodyPart + ex.exerciseName),
      );
      expect(result).toEqual(newExercises.map((exercise) => new FilteredExerciseDto(exercise)));
    });

    it('should return empty array if all exercises are already in database', async () => {
      const getExercisesRequest: GetExercisesRequestDto = {
        exercises: [
          { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
          { exerciseName: 'Dead lift', bodyPart: BodyPart.BACK },
        ],
      };
      const foundExercises = [
        new Exercise({ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }),
        new Exercise({ exerciseName: 'Dead lift', bodyPart: BodyPart.BACK }),
      ];

      mockRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(foundExercises);

      const result = await service.findNewExercises(getExercisesRequest);
      expect(result).toEqual([]);
    });

    it('should throw an error if an exception occurs during repository call', async () => {
      const getExercisesRequest: GetExercisesRequestDto = {
        exercises: [{ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }],
      };

      mockRepository.findExercisesByExerciseNameAndBodyPart.mockRejectedValue(new Error('Database error'));

      await expect(service.findNewExercises(getExercisesRequest)).rejects.toThrow(
        'Error while finding new exercises: Database error',
      );
    });
  });

  describe('test bulkInsertExercises', () => {
    it('should return new exercises if new exercises are saved', async () => {
      const saveExercises: SaveExercisesRequestDto = {
        exercises: [
          { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
          { exerciseName: 'Dead lift', bodyPart: BodyPart.BACK },
        ],
      };
      const savedExercises = saveExercises.exercises.map(
        (exercise) => new Exercise({ bodyPart: exercise.bodyPart, exerciseName: exercise.exerciseName }),
      );

      mockRepository.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue([]);
      mockRepository.bulkInsertExercises.mockResolvedValue(savedExercises);

      const result = await service.bulkInsertExercises(saveExercises);
      expect(result).toEqual(saveExercises.exercises);
    });

    it('should throw ConflictException if some or all exercises already exist', async () => {
      const saveExercisesRequest: SaveExercisesRequestDto = {
        exercises: [{ exerciseName: 'Deadlift', bodyPart: BodyPart.BACK }],
      };

      const foundExercises = saveExercisesRequest.exercises.map(
        (exercise) => new Exercise({ bodyPart: exercise.bodyPart, exerciseName: exercise.exerciseName }),
      );
      mockRepository.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue(foundExercises);

      await expect(service.bulkInsertExercises(saveExercisesRequest)).rejects.toThrow(
        new ConflictException('Some or all exercises already exist. No new data was saved.'),
      );
    });
  });

  describe('test bulkSoftDelete', () => {
    it('should return no contents if exercises are deleted', async () => {
      const requestDelete: DeleteExerciseRequestDto = { ids: [1, 2, 3] };
      const foundExercises: Exercise[] = [
        new Exercise({ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }),
        new Exercise({ exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST }),
        new Exercise({ exerciseName: 'Dead lift', bodyPart: BodyPart.BACK }),
      ];

      mockRepository.bulkSoftDelete.mockResolvedValue();
      mockRepository.findExercisesByIds.mockResolvedValue(foundExercises);

      const result = await service.bulkSoftDelete(requestDelete);
      expect(result).toEqual(undefined);
    });

    it('should return BadRequestException if exercises to be deleted does not found in database', async () => {
      const requestDelete: DeleteExerciseRequestDto = { ids: [1, 2, 3] };
      const foundExercises: Exercise[] = [
        new Exercise({ exerciseName: 'Squat', bodyPart: BodyPart.LEGS }),
        new Exercise({ exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST }),
      ];

      mockRepository.bulkSoftDelete.mockResolvedValue();
      mockRepository.findExercisesByIds.mockResolvedValue(foundExercises);

      await expect(service.bulkSoftDelete(requestDelete)).rejects.toThrow(BadRequestException);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
