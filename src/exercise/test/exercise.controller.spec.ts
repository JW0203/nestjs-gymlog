import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseController } from '../presentation/exercise.controller';
import { ExerciseService } from '../application/exercise.service';
import { DeleteExerciseRequestDto } from '../dto/deleteExercise.request.dto';
import { SaveExercisesRequestDto } from '../dto/saveExercises.request.dto';
import { ExerciseDataFormatDto } from '../../common/dto/exerciseData.format.dto';
import { RequestMethod } from '@nestjs/common';
import { BodyPart } from '../../common/bodyPart.enum';
import { HTTP_CODE_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';

const mockExerciseService = {
  bulkSoftDelete: jest.fn(),
  bulkInsertExercises: jest.fn(),
  findOneByExerciseNameAndBodyPart: jest.fn(),
  findAll: jest.fn(),
};
describe('ExerciseController', () => {
  let exerciseController: ExerciseController;
  let exerciseService: jest.Mocked<typeof mockExerciseService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [
        {
          provide: ExerciseService,
          useValue: mockExerciseService,
        },
      ],
    }).compile();

    exerciseController = module.get<ExerciseController>(ExerciseController);
    exerciseService = module.get(ExerciseService);
  });

  describe('softDelete', () => {
    it('should call bulkSoftDelete with the correct parameters', async () => {
      const deleteExerciseRequestDto: DeleteExerciseRequestDto = { ids: [1, 2, 3] };
      await exerciseController.softDelete(deleteExerciseRequestDto);
      expect(exerciseService.bulkSoftDelete).toHaveBeenCalledWith(deleteExerciseRequestDto);
    });

    it('should have correct Http status code 204', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, exerciseController.softDelete);
      expect(httpCode).toBe(204);
    });

    it('should have correct method DELETE and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, exerciseController.softDelete);
      const method = Reflect.getMetadata(METHOD_METADATA, exerciseController.softDelete);
      expect(method).toBe(RequestMethod.DELETE);
      expect(path).toBe('/');
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

    it('should have correct Http status code 201', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, exerciseController.saveExercises);
      expect(httpCode).toBe(201);
    });

    it('should have correct method POST and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, exerciseController.saveExercises);
      const method = Reflect.getMetadata(METHOD_METADATA, exerciseController.saveExercises);
      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('/');
    });
  });

  describe('getExerciseByNameAndBodyPart', () => {
    it('should call findOneByExerciseNameAndBodyPart with the correct parameters', async () => {
      const exerciseData: ExerciseDataFormatDto = { exerciseName: 'Push Up', bodyPart: BodyPart.CHEST };
      await exerciseController.getExerciseByNameAndBodyPart(exerciseData);
      expect(exerciseService.findOneByExerciseNameAndBodyPart).toHaveBeenCalledWith(exerciseData);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, exerciseController.getExerciseByNameAndBodyPart);
      expect(httpCode).toBe(200);
    });

    it('should have correct method GET and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, exerciseController.getExerciseByNameAndBodyPart);
      const method = Reflect.getMetadata(METHOD_METADATA, exerciseController.getExerciseByNameAndBodyPart);
      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });
  });

  describe('getAll', () => {
    it('should call findAll', async () => {
      await exerciseController.getAll();
      expect(exerciseService.findAll).toHaveBeenCalled();
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, exerciseController.getAll);
      expect(httpCode).toBe(200);
    });

    it('should have correct method GET and path "all" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, exerciseController.getAll);
      const method = Reflect.getMetadata(METHOD_METADATA, exerciseController.getAll);
      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('all');
    });
  });
});
