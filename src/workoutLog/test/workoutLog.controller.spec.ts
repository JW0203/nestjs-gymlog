import { WorkoutLogController } from '../presentation/workoutLog.controller';
import { Test, TestingModule } from '@nestjs/testing';
import { WorkoutLogService } from '../application/workoutLog.service';
import { GUARDS_METADATA, HTTP_CODE_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { RequestMethod } from '@nestjs/common';
import { SaveWorkoutLogsRequestDto } from '../dto/saveWorkoutLogs.request.dto';
import { BodyPart } from '../../common/bodyPart.enum';
import { UpdateWorkoutLogsRequestDto } from '../dto/updateWorkoutLogs.request.dto';
import { SoftDeleteWorkoutLogRequestDto } from '../dto/softDeleteWorkoutLog.request.dto';

const mockWorkoutLogService = {
  bulkInsertWorkoutLogs: jest.fn(),
  getAggregatedWorkoutLogsByUser: jest.fn(),
  bulkUpdateWorkoutLogs: jest.fn(),
  softDeleteWorkoutLogs: jest.fn(),
  getWorkoutLogsByUser: jest.fn(),
};

describe('Test WorkoutLogController', () => {
  let workoutLogController: WorkoutLogController;
  let workoutLogService: jest.Mocked<typeof mockWorkoutLogService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkoutLogController],
      providers: [
        {
          provide: WorkoutLogService,
          useValue: mockWorkoutLogService,
        },
      ],
    }).compile();

    workoutLogController = module.get<WorkoutLogController>(WorkoutLogController);
    workoutLogService = module.get<typeof mockWorkoutLogService>(WorkoutLogService);
  });

  describe('saveWorkoutLogs', () => {
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, workoutLogController.saveWorkoutLogs);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 201', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, workoutLogController.saveWorkoutLogs);
      expect(httpCode).toBe(201);
    });

    it('should have correct method POST and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, workoutLogController.saveWorkoutLogs);
      const method = Reflect.getMetadata(METHOD_METADATA, workoutLogController.saveWorkoutLogs);
      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('/');
    });

    it('should call service method bulkInsertWorkoutLogs with parameters', async () => {
      const req = { user: { id: 1 } };
      const saveWorkoutLogs: SaveWorkoutLogsRequestDto = {
        workoutLogs: [
          { exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 1, weight: 10, repeatCount: 15 },
          { exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 2, weight: 10, repeatCount: 15 },
          { exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 3, weight: 10, repeatCount: 15 },
        ],
      };
      await workoutLogController.saveWorkoutLogs(saveWorkoutLogs, req);

      expect(workoutLogService.bulkInsertWorkoutLogs).toHaveBeenCalledWith(req.user.id, saveWorkoutLogs);
    });
  });

  describe('getWorkoutLogs', () => {
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, workoutLogController.getWorkoutLogs);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, workoutLogController.getWorkoutLogs);
      expect(httpCode).toBe(200);
    });

    it('should have correct method GET and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, workoutLogController.getWorkoutLogs);
      const method = Reflect.getMetadata(METHOD_METADATA, workoutLogController.getWorkoutLogs);
      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should call service method getAggregatedWorkoutLogsByUser with parameters', async () => {
      const date = '2024-12-06';
      const req = { user: { id: 1 } };

      await workoutLogController.getWorkoutLogs(date, req);

      expect(workoutLogService.getAggregatedWorkoutLogsByUser).toHaveBeenCalledWith(date, req.user.id);
    });
  });

  describe('bulkUpdateWorkoutLogs', () => {
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, workoutLogController.bulkUpdateWorkoutLogs);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, workoutLogController.bulkUpdateWorkoutLogs);
      expect(httpCode).toBe(200);
    });

    it('should have correct method PATCH and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, workoutLogController.bulkUpdateWorkoutLogs);
      const method = Reflect.getMetadata(METHOD_METADATA, workoutLogController.bulkUpdateWorkoutLogs);
      expect(method).toBe(RequestMethod.PATCH);
      expect(path).toBe('/');
    });

    it('should call service method bulkUpdateWorkoutLogs with parameters', async () => {
      const req = { user: { id: 1 } };
      const updateWorkoutLogs: UpdateWorkoutLogsRequestDto = {
        updateWorkoutLogs: [
          { id: 1, exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 1, weight: 10, repeatCount: 15 },
          { id: 2, exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 2, weight: 10, repeatCount: 15 },
          { id: 3, exerciseName: 'squat', bodyPart: BodyPart.LEGS, setCount: 3, weight: 10, repeatCount: 15 },
        ],
      };
      await workoutLogController.bulkUpdateWorkoutLogs(req, updateWorkoutLogs);

      expect(workoutLogService.bulkUpdateWorkoutLogs).toHaveBeenCalledWith(req.user.id, updateWorkoutLogs);
    });
  });
  describe('softDeleteWorkoutLogs', () => {
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, workoutLogController.softDeleteWorkoutLogs);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 204', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, workoutLogController.softDeleteWorkoutLogs);
      expect(httpCode).toBe(204);
    });

    it('should have correct method DELETE and path "/" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, workoutLogController.softDeleteWorkoutLogs);
      const method = Reflect.getMetadata(METHOD_METADATA, workoutLogController.softDeleteWorkoutLogs);
      expect(method).toBe(RequestMethod.DELETE);
      expect(path).toBe('/');
    });

    it('should call service method ? with parameters', async () => {
      const req = { user: { id: 1 } };
      const softDeleteWorkoutLogRequestDto: SoftDeleteWorkoutLogRequestDto = {
        ids: [1, 2, 3],
      };
      await workoutLogController.softDeleteWorkoutLogs(softDeleteWorkoutLogRequestDto, req);

      expect(workoutLogService.softDeleteWorkoutLogs).toHaveBeenCalledWith(softDeleteWorkoutLogRequestDto, req.user);
    });
  });

  describe('getAggregatedWorkoutLogsByUser', () => {
    it('should use JwtAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, workoutLogController.getAggregatedWorkoutLogsByUser);
      expect(guards[0]).toBe(JwtAuthGuard);
    });

    it('should have correct Http status code 200', () => {
      const httpCode = Reflect.getMetadata(HTTP_CODE_METADATA, workoutLogController.getAggregatedWorkoutLogsByUser);
      expect(httpCode).toBe(200);
    });

    it('should have correct method GET and path "/user" ', () => {
      const path = Reflect.getMetadata(PATH_METADATA, workoutLogController.saveWorkoutLogs);
      const method = Reflect.getMetadata(METHOD_METADATA, workoutLogController.getAggregatedWorkoutLogsByUser);
      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should call service method getWorkoutLogByUser with parameters', async () => {
      const req = { user: { id: 1 } };

      await workoutLogController.getAggregatedWorkoutLogsByUser(req);
      expect(workoutLogService.getWorkoutLogsByUser).toHaveBeenCalledWith(req.user);
    });
  });
});
