import { RoutineController } from '../presentation/routine.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutineService } from '../application/routine.service';
import { BodyPart } from '../../common/bodyPart.enum';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { GUARDS_METADATA, HTTP_CODE_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { SoftDeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';
import { SaveRoutineRequestDto } from '../dto/saveRoutine.request.dto';

const mockRoutineService = {
  saveRoutine: jest.fn(),
  getRoutineByName: jest.fn(),
  getAllRoutinesByUser: jest.fn(),
  bulkUpdateRoutines: jest.fn(),
  softDeleteRoutines: jest.fn(),
};

describe('RoutineController', () => {
  let routineController: RoutineController;
  let routineService: jest.Mocked<typeof mockRoutineService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoutineController],
      providers: [
        {
          provide: RoutineService,
          useValue: mockRoutineService,
        },
      ],
    }).compile();

    routineController = module.get<RoutineController>(RoutineController);
    routineService = module.get(RoutineService);
  });

  describe('postRoutine', () => {
    it('should call service method (saveRoutine) with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const orderAndExercise = [
        {
          order: 1,
          exercise: { bodyPart: BodyPart.BACK, exerciseName: 'dead lift' },
        },
      ];
      const saveRoutineRequest: SaveRoutineRequestDto = { routineName: 'testRoutine', orderAndExercise };
      await routineController.postRoutine(saveRoutineRequest, req);

      expect(routineService.saveRoutine).toHaveBeenCalledWith(saveRoutineRequest, req.user);
    });

    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routineController.postRoutine);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 201', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, routineController.postRoutine);
      expect(httpCode).toBe(201);
    });

    it('should have correct method POST and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, routineController.postRoutine);
      const method = Reflect.getMetadata(METHOD_METADATA, routineController.postRoutine);
      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('/');
    });
  });

  describe('getRoutine', () => {
    it('should call service method (getRoutineByName) with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const getRoutineByName: GetRoutineByNameRequestDto = { name: '등 데이' };

      await routineService.getRoutineByName(getRoutineByName, req.user);
      expect(routineService.getRoutineByName).toHaveBeenCalledWith(getRoutineByName, req.user);
    });
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routineController.getRoutine);

      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, routineController.getRoutine);

      expect(httpCode).toBe(200);
    });

    it('should have correct method GET and path "/"', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, routineController.getRoutine);
      const path = Reflect.getMetadata(PATH_METADATA, routineController.getRoutine);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });
  });

  describe('getAllRoutineByUser', () => {
    it('should call service method (getRoutineByName) with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const getRoutineByName: GetRoutineByNameRequestDto = { name: '등 데이' };

      await routineService.getRoutineByName(getRoutineByName, req.user);
      expect(routineService.getRoutineByName).toHaveBeenCalledWith(getRoutineByName, req.user);
    });
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routineController.getAllRoutineByUser);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, routineController.getAllRoutineByUser);
      expect(httpCode).toBe(200);
    });

    it('should have correct method Get and path all', () => {
      const path = Reflect.getMetadata(PATH_METADATA, routineController.getAllRoutineByUser);
      const method = Reflect.getMetadata(METHOD_METADATA, routineController.getAllRoutineByUser);
      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('all');
    });
  });

  describe('patchRoutine', () => {
    it('should call service method (bulkUpdateRoutines) with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const updateRoutinesRequestDto: UpdateRoutinesRequestDto = {
        id: 1,
        routineName: 'back routine',
        updateData: [{ order: 1, exerciseName: 'cable pulldown', bodyPart: BodyPart.BACK }],
      };
      await routineService.bulkUpdateRoutines(updateRoutinesRequestDto, req.user);
      expect(routineService.bulkUpdateRoutines).toHaveBeenCalledWith(updateRoutinesRequestDto, req.user);
    });

    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routineController.patchRoutine);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, routineController.patchRoutine);
      expect(httpCode).toBe(200);
    });

    it('should have correct method PATCH and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, routineController.patchRoutine);
      const method = Reflect.getMetadata(METHOD_METADATA, routineController.patchRoutine);
      expect(method).toBe(RequestMethod.PATCH);
      expect(path).toBe('/');
    });
  });

  describe('deleteRoutine', () => {
    it('should call service method (softDeleteRoutines) with correct parameters', async () => {
      const req = { user: { id: 1 } };
      const softDeleteRoutineByIds: SoftDeleteRoutineRequestDto = { ids: [1, 2] };

      await routineService.softDeleteRoutines(softDeleteRoutineByIds, req.user);
      expect(routineService.softDeleteRoutines).toHaveBeenCalledWith(softDeleteRoutineByIds, req.user);
    });
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, routineController.deleteRoutine);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, routineController.deleteRoutine);
      expect(httpCode).toBe(204);
    });

    it('should have correct method PATCH and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, routineController.deleteRoutine);
      const method = Reflect.getMetadata(METHOD_METADATA, routineController.deleteRoutine);
      expect(method).toBe(RequestMethod.DELETE);
      expect(path).toBe('/');
    });
  });
});
