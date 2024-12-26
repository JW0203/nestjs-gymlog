import { RoutineController } from '../presentation/routine.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { RoutineService } from '../application/routine.service';
import { SaveRoutineFormatDto } from '../dto/saveRoutine.format.dto';
import { BodyPart } from '../../common/bodyPart.enum';
import { SaveRoutinesRequestDto } from '../dto/saveRoutines.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { GetRoutineByNameRequestDto } from '../dto/getRoutineByName.request.dto';
import { GUARDS_METADATA, HTTP_CODE_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { DeleteRoutineRequestDto } from '../dto/deleteRoutine.request.dto';
import { UpdateRoutinesRequestDto } from '../dto/updateRoutines.request.dto';

const mockRoutineService = {
  bulkInsertRoutines: jest.fn(),
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
    it('should call service method (bulkInsertRoutines) with correct parameters', async () => {
      const req = { user: { id: 1 } };

      const routines: SaveRoutineFormatDto[] = [
        {
          routineName: '등데이',
          exerciseName: '케이블 암 풀다운',
          bodyPart: BodyPart.BACK,
        },
        {
          routineName: '등데이',
          exerciseName: '어시스트 풀업 머신',
          bodyPart: BodyPart.BACK,
        },
      ];
      const saveRoutinesDto: SaveRoutinesRequestDto = { routines };

      await routineController.postRoutine(saveRoutinesDto, req);

      expect(routineService.bulkInsertRoutines).toHaveBeenCalledWith(req.user, saveRoutinesDto);
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
        updateData: [{ id: 1, routineName: '등 루틴', exerciseName: '케이블 암 풀다운', bodyPart: BodyPart.BACK }],
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
      const softDeleteRoutineByIds: DeleteRoutineRequestDto = { ids: [1, 2] };

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
