import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseController } from '../presentation/exercise.controller';
import { ExerciseService } from '../application/exercise.service';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { BodyPart } from '../../common/bodyPart.enum';

describe('ExerciseController', () => {
  let exerciseController: ExerciseController;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [
        {
          provide: ExerciseService,
          useValue: {
            bulkSoftDelete: jest.fn(),
            bulkInsertExercises: jest.fn(),
            findOneByExerciseNameAndBodyPart: jest.fn(),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    exerciseController = module.get<ExerciseController>(ExerciseController);
    exerciseService = module.get<ExerciseService>(ExerciseService);
  });

  describe('softDelete', () => {
    it('should call bulkSoftDelete with the correct parameters', async () => {
      const deleteExerciseRequestDto: DeleteExerciseRequestDto = { ids: [1, 2, 3] };
      await exerciseController.softDelete(deleteExerciseRequestDto);
      expect(exerciseService.bulkSoftDelete).toHaveBeenCalledWith(deleteExerciseRequestDto);
    });

    it('should throw BadRequestException if some exercises do not exist', async () => {
      const deleteExerciseRequestDto: DeleteExerciseRequestDto = { ids: [1, 2, 3] };
      jest
        .spyOn(exerciseService, 'bulkSoftDelete')
        .mockRejectedValue(new BadRequestException('Some exercises do not exist'));
      await expect(exerciseController.softDelete(deleteExerciseRequestDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('saveExercises', () => {
    it('should call bulkInsertExercises with the correct parameters', async () => {
      const saveExercisesRequestDto: SaveExercisesRequestDto = {
        exercises: [{ exerciseName: 'Push Up', bodyPart: BodyPart.CHEST }],
      };
      await exerciseController.saveExercises(saveExercisesRequestDto);
      expect(exerciseService.bulkInsertExercises).toHaveBeenCalledWith(saveExercisesRequestDto);
    });

    it('should throw ConflictException if some exercises already exist', async () => {
      const saveExercisesRequestDto: SaveExercisesRequestDto = {
        exercises: [{ exerciseName: 'Push Up', bodyPart: BodyPart.CHEST }],
      };
      jest
        .spyOn(exerciseService, 'bulkInsertExercises')
        .mockRejectedValue(new ConflictException('Some or all exercises already exist'));
      await expect(exerciseController.saveExercises(saveExercisesRequestDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getExerciseByNameAndBodyPart', () => {
    it('should call findOneByExerciseNameAndBodyPart with the correct parameters', async () => {
      const exerciseData: ExerciseDataFormatDto = { exerciseName: 'Push Up', bodyPart: BodyPart.CHEST };
      await exerciseController.getExerciseByNameAndBodyPart(exerciseData);
      expect(exerciseService.findOneByExerciseNameAndBodyPart).toHaveBeenCalledWith(exerciseData);
    });

    it('should throw NotFoundException if exercise is not found', async () => {
      const exerciseData: ExerciseDataFormatDto = { exerciseName: 'Push Up', bodyPart: BodyPart.CHEST };
      jest
        .spyOn(exerciseService, 'findOneByExerciseNameAndBodyPart')
        .mockRejectedValue(new BadRequestException('Exercise not found'));
      await expect(exerciseController.getExerciseByNameAndBodyPart(exerciseData)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getAll', () => {
    it('should call findAll', async () => {
      await exerciseController.getAll();
      expect(exerciseService.findAll).toHaveBeenCalled();
    });
  });
});
