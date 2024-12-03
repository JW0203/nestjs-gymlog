import { BodyPart } from '../../common/bodyPart.enum';
import { ExerciseRepository } from '../domain/exercise.repository';
import { Exercise } from '../domain/Exercise.entity';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { MySqlLock } from '../../common/type/typeormLock.type';
import { LockConfigManager } from '../../common/infrastructure/typeormMysql.lock';

const mockExerciseRepository: jest.Mocked<ExerciseRepository> = {
  findOneByExerciseNameAndBodyPart: jest.fn(),
  findExercisesByExerciseNameAndBodyPart: jest.fn(),
  findExercisesByExerciseNameAndBodyPartLockMode: jest.fn(),
  findAll: jest.fn(),
  findExercisesByIds: jest.fn(),
  bulkInsertExercises: jest.fn(),
  bulkSoftDelete: jest.fn(),
};

describe('ExerciseRepository', () => {
  let exerciseRepository: jest.Mocked<ExerciseRepository>;

  beforeEach(async () => {
    exerciseRepository = mockExerciseRepository;
  });

  describe('findOneByExerciseNameAndBodyPart', () => {
    it('should find a exercise data using the specific exercise name and body part', async () => {
      const mockExercise = new Exercise({ exerciseName: 'Squat', bodyPart: BodyPart.LEGS });
      mockExercise.id = 1;

      exerciseRepository.findOneByExerciseNameAndBodyPart.mockResolvedValue(mockExercise);

      const result = await exerciseRepository.findOneByExerciseNameAndBodyPart('Squat', BodyPart.LEGS);
      expect(result).toEqual(mockExercise);
    });
  });

  describe('findExercisesByExerciseNameAndBodyPart', () => {
    it('should find exercises using their exercise name and body part', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const mockExercises = exerciseDtos.map((dto, index) => {
        const exercise = new Exercise({ exerciseName: dto.exerciseName, bodyPart: dto.bodyPart });
        exercise.id = index + 1;
        return exercise;
      });

      exerciseRepository.findExercisesByExerciseNameAndBodyPart.mockResolvedValue(mockExercises);

      const result = await exerciseRepository.findExercisesByExerciseNameAndBodyPart(exerciseDtos);
      expect(result).toEqual(mockExercises);
    });
  });

  describe('findExercisesByExerciseNameAndBodyPartLockMode', () => {
    it('should find exercises using their exercise name and body part on lock mode', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const mockExercises = exerciseDtos.map((dto, index) => {
        const exercise = new Exercise({ exerciseName: dto.exerciseName, bodyPart: dto.bodyPart });
        exercise.id = index + 1;
        return exercise;
      });
      const lockMode: MySqlLock = LockConfigManager.setLockConfig('mySQLPessimistic', { mode: 'pessimistic_write' });
      exerciseRepository.findExercisesByExerciseNameAndBodyPartLockMode.mockResolvedValue(mockExercises);

      const result = await exerciseRepository.findExercisesByExerciseNameAndBodyPartLockMode(exerciseDtos, lockMode);
      expect(result).toEqual(mockExercises);
    });
  });

  describe('findAll', () => {
    it('should find all exercises', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const mockExercises = exerciseDtos.map((dto, index) => {
        const exercise = new Exercise({ exerciseName: dto.exerciseName, bodyPart: dto.bodyPart });
        exercise.id = index + 1;
        return exercise;
      });

      exerciseRepository.findAll.mockResolvedValue(mockExercises);

      const result = await exerciseRepository.findAll();
      expect(result).toEqual(mockExercises);
    });
  });

  describe('findExercisesByIds', () => {
    it('should find exercises using their ids', async () => {
      const ids = [1, 2];
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const mockExercises = exerciseDtos.map((dto, index) => {
        const exercise = new Exercise({ exerciseName: dto.exerciseName, bodyPart: dto.bodyPart });
        exercise.id = index + 1;
        return exercise;
      });

      exerciseRepository.findExercisesByIds.mockResolvedValue(mockExercises);

      const result = await exerciseRepository.findExercisesByIds(ids);
      expect(result).toEqual(mockExercises);
    });
  });

  describe('bulkInsertExercises', () => {
    it('should save exercises at once', async () => {
      const exerciseDtos: ExerciseDataFormatDto[] = [
        { exerciseName: 'Squat', bodyPart: BodyPart.LEGS },
        { exerciseName: 'Bench Press', bodyPart: BodyPart.CHEST },
      ];

      const mockExercises = exerciseDtos.map((dto, index) => {
        const exercise = new Exercise({ exerciseName: dto.exerciseName, bodyPart: dto.bodyPart });
        exercise.id = index + 1;
        return exercise;
      });

      exerciseRepository.bulkInsertExercises.mockResolvedValue(mockExercises);

      const result = await exerciseRepository.bulkInsertExercises(exerciseDtos);
      expect(result).toEqual(mockExercises);
    });
  });

  describe('bulkSoftDelete', () => {
    it('should remove exercises at once using their ids', async () => {
      const ids = [1, 2];

      exerciseRepository.bulkSoftDelete.mockResolvedValue();

      await exerciseRepository.bulkSoftDelete(ids);
      expect(exerciseRepository.bulkSoftDelete).toHaveBeenCalledWith(ids);
    });
  });
});
