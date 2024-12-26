import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../presentation/user.controller';
import { UserService } from '../application/user.service';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { GUARDS_METADATA, HTTP_CODE_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { RequestMethod } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';

const mockUserService = {
  signUp: jest.fn(),
  signIn: jest.fn(),
  getMyInfo: jest.fn(),
  softDeleteUser: jest.fn(),
};

describe('Test User controller', () => {
  let userController: UserController;
  let userService: jest.Mocked<typeof mockUserService>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userService = module.get(UserService);
    userController = module.get(UserController);
  });

  describe('signUp', () => {
    it('should call signIn service with correct parameters', async () => {
      const signUpRequestDto: SignUpRequestDto = { email: 'test@email.com', password: 'test12345', name: 'tester' };
      await userService.signUp(signUpRequestDto);
      expect(userService.signUp).toHaveBeenCalledWith(signUpRequestDto);
    });

    it('should have correct method POST and path "/" ', async () => {
      const method = Reflect.getMetadata(METHOD_METADATA, userController.signUp);
      const path = Reflect.getMetadata(PATH_METADATA, userController.signUp);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('/');
    });

    it('should have correct Http status code 201', () => {
      const httpStatus = Reflect.getMetadata(HTTP_CODE_METADATA, userController.signUp);
      expect(httpStatus).toBe(201);
    });
  });

  describe('signIn', () => {
    it('should call signIn service with correct parameters', async () => {
      const signInRequestDto: SignInRequestDto = { email: 'test@email.com', password: 'test12345' };
      await userService.signIn(signInRequestDto);

      expect(userService.signIn).toHaveBeenCalledWith(signInRequestDto);
    });

    it('should have correct method Post and path "sign-in" ', async () => {
      const method = Reflect.getMetadata(METHOD_METADATA, userController.signIn);
      const path = Reflect.getMetadata(PATH_METADATA, userController.signIn);

      expect(method).toBe(RequestMethod.POST);
      expect(path).toBe('sign-in');
    });

    it('should have correct Http status code 201', () => {
      const httpStatus = Reflect.getMetadata(HTTP_CODE_METADATA, userController.signIn);
      expect(httpStatus).toBe(200);
    });
  });

  describe('getMyInfo', () => {
    it('should call getMyInfo service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      await userService.getMyInfo(req.user.id);

      expect(userService.getMyInfo).toHaveBeenCalledWith(req.user.id);
    });

    it('should have correct method GET and paht "/" ', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, userController.getMyInfo);
      const path = Reflect.getMetadata(PATH_METADATA, userController.getMyInfo);

      expect(method).toBe(RequestMethod.GET);
      expect(path).toBe('/');
    });

    it('should have correct Http status code 200', () => {
      const httpStatus = Reflect.getMetadata(HTTP_CODE_METADATA, userController.getMyInfo);
      expect(httpStatus).toBe(200);
    });

    it('should use JwtAuthGuard', () => {
      const guard = Reflect.getMetadata(GUARDS_METADATA, userController.getMyInfo);
      expect(guard[0]).toBe(JwtAuthGuard);
    });
  });

  describe('softDeleteUser', () => {
    it('should call getMyInfo service with correct parameters', async () => {
      const req = { user: { id: 1 } };
      await userService.softDeleteUser(req.user.id);

      expect(userService.softDeleteUser).toHaveBeenCalledWith(req.user.id);
    });

    it('should have correct method DELETE and paht "/" ', () => {
      const method = Reflect.getMetadata(METHOD_METADATA, userController.softDeleteUser);
      const path = Reflect.getMetadata(PATH_METADATA, userController.softDeleteUser);

      expect(method).toBe(RequestMethod.DELETE);
      expect(path).toBe('/');
    });

    it('should have correct Http status code 200', () => {
      const httpStatus = Reflect.getMetadata(HTTP_CODE_METADATA, userController.softDeleteUser);
      expect(httpStatus).toBe(204);
    });

    it('should use JwtAuthGuard', () => {
      const guard = Reflect.getMetadata(GUARDS_METADATA, userController.softDeleteUser);
      expect(guard[0]).toBe(JwtAuthGuard);
    });
  });
});
