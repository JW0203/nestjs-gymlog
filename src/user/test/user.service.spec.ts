import { UserService } from '../application/user.service';
import { UserRepository } from '../domain/user.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../common/const/inject.constant';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { User } from '../domain/User.entity';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';
import { BcryptHasherService } from '../application/bcryptHasher.service';
import { WorkoutLogService } from '../../workoutLog/application/workoutLog.service';
import { RoutineService } from '../../routine/application/routine.service';
import { WorkoutLog } from '../../workoutLog/domain/WorkoutLog.entity';
import { WorkoutLogResponseDto } from '../../workoutLog/dto/workoutLog.response.dto';
import { Exercise } from '../../exercise/domain/Exercise.entity';
import { BodyPart } from '../../common/bodyPart.enum';
import { Routine } from '../../routine/domain/Routine.entity';
import { GetAllRoutineByUserResponseDto } from '../../routine/dto/getAllRoutineByUser.response.dto';

jest.mock('typeorm-transactional', () => ({
  Transactional: () => jest.fn(),
  initializeTransactionalContext: jest.fn(),
}));

const mockPasswordHasher: jest.Mocked<BcryptHasherService> = {
  hash: jest.fn().mockReturnValue('hashedPassword'),
  compare: jest.fn(),
};

const mockUserRepository: jest.Mocked<UserRepository> = {
  signUp: jest.fn(),
  findOneUserByEmailLockMode: jest.fn(),
  findOneUserByEmail: jest.fn(),
  findOneUserById: jest.fn(),
  softDeleteUser: jest.fn(),
  findOneUserByNickName: jest.fn(),
  updateNickName: jest.fn(),
  updateEmail: jest.fn(),
};

const mockJwtService: Partial<jest.Mocked<JwtService>> = {
  sign: jest.fn(),
};

const mockAuthService = {
  signInWithJWT: jest.fn(),
};

const mockConfigService = {
  get: jest.fn(),
};

const mockWorkoutLogService = {
  findWorkoutLogsByUser: jest.fn(),
  softDeleteWorkoutLogs: jest.fn(),
};

const mockRoutineService = {
  findAllRoutinesByUserId: jest.fn(),
  softDeleteRoutines: jest.fn(),
};

describe('UserRepository', () => {
  let userRepository: jest.Mocked<typeof mockUserRepository>;
  let userService: UserService;
  let jwtService: jest.Mocked<typeof mockJwtService>;
  let configService: jest.Mocked<typeof mockConfigService>;
  let authService: jest.Mocked<typeof mockAuthService>;
  let passwordHasher: jest.Mocked<typeof mockPasswordHasher>;
  let workoutLogService: jest.Mocked<typeof mockWorkoutLogService>;
  let routineService: jest.Mocked<typeof mockRoutineService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: USER_REPOSITORY, useValue: mockUserRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PASSWORD_HASHER, useValue: mockPasswordHasher },
        { provide: WorkoutLogService, useValue: mockWorkoutLogService },
        { provide: RoutineService, useValue: mockRoutineService },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    passwordHasher = module.get(PASSWORD_HASHER);
    configService = module.get(ConfigService);
    jwtService = module.get(JwtService);
    userRepository = module.get(USER_REPOSITORY);
    authService = module.get(AuthService);
    workoutLogService = module.get(WorkoutLogService);
    routineService = module.get(RoutineService);
  });

  describe('signUp', () => {
    it('should throw ConflictException if email is already in use', async () => {
      const usedEmail = 'useremail@email.com';
      const signUpRequestDto: SignUpRequestDto = { nickName: 'tester', email: usedEmail, password: '12345678' };
      const { email, nickName, password } = signUpRequestDto;
      const user: User = new User({ email, nickName, password });
      user.id = 1;

      userRepository.findOneUserByEmailLockMode.mockResolvedValue(user);

      await expect(userService.signUp(signUpRequestDto)).rejects.toThrow(ConflictException);
    });

    it('should throw Error if saltRounds is not set in configService', async () => {
      const usedEmail = 'useremail@email.com';
      const signUpRequestDto: SignUpRequestDto = { nickName: 'tester', email: usedEmail, password: '12345678' };
      const { email, nickName, password } = signUpRequestDto;
      const user: User = new User({ email, nickName, password });
      user.id = 1;

      userRepository.findOneUserByEmailLockMode.mockResolvedValue(null);
      configService.get.mockReturnValue(undefined);

      await expect(userService.signUp(signUpRequestDto)).rejects.toThrow(Error);
    });

    it('should sign up a new user ', async () => {
      const signUpRequestDto: SignUpRequestDto = { nickName: 'tester', email: 'test@email.com', password: '12345678' };
      const { email, nickName, password } = signUpRequestDto;
      const newUser: User = new User({ email, nickName, password });
      newUser.id = 1;
      const saltRounds = '10';
      const signUpResponseDto: SignUpResponseDto = { id: 1, email: 'test@email.com', nickName: 'tester' };

      userRepository.findOneUserByEmailLockMode.mockResolvedValue(null);
      configService.get.mockReturnValue(saltRounds);
      userRepository.signUp.mockResolvedValue(newUser);

      const result = await userService.signUp(signUpRequestDto);
      expect(result).toEqual(signUpResponseDto);
      expect(passwordHasher.hash).toHaveBeenCalledWith(password, parseInt(saltRounds));
    });
  });

  describe('signIn', () => {
    it('Should throw NotFoundException if it can not find user ', async () => {
      const email = 'nonuser@email.com';
      const password = '12345678';
      const signInRequestDto: SignInRequestDto = { email, password };
      userRepository.findOneUserByEmail.mockResolvedValue(null);

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(NotFoundException);
    });

    it('Should throw UnauthorizedException if the password does not match', async () => {
      const email = 'user@email.com';
      const password = '12345678';
      const wrongPassword = '12345678w';
      const signInRequestDto: SignInRequestDto = { email, password: wrongPassword };

      const user: User = new User({ email, password, nickName: 'tester' });
      user.id = 1;

      userRepository.findOneUserByEmail.mockResolvedValue(user);
      mockPasswordHasher.compare.mockResolvedValue(false);

      await expect(userService.signIn(signInRequestDto)).rejects.toThrow(UnauthorizedException);
      expect(mockPasswordHasher.compare).toHaveBeenCalledWith(wrongPassword, password);
    });

    it('Should return accessToken if the password match and user is exist', async () => {
      const signInRequestDto: SignInRequestDto = { email: 'user@email.com', password: '12345678' };
      const user: User = new User({
        nickName: 'tester',
        email: signInRequestDto.email,
        password: signInRequestDto.password,
      });
      user.id = 1;
      const expectResult: SignInResponseDto = { accessToken: 'accessToken' };

      userRepository.findOneUserByEmail.mockResolvedValue(user);
      authService.signInWithJWT.mockReturnValue('accessToken');
      mockPasswordHasher.compare.mockResolvedValue(true);

      const result = await userService.signIn(signInRequestDto);
      expect(result).toEqual(expectResult);
    });
  });

  describe('getMyInfo', () => {
    it('Should throw NotFoundException if it cannot find user using user id', async () => {
      const userId: number = 1;

      userRepository.findOneUserById.mockResolvedValue(null);

      await expect(userService.getMyInfo(userId)).rejects.toThrow(NotFoundException);
    });

    it('Should return user information if it find user using user id', async () => {
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: '12345678' });
      user.id = 1;
      user.createdAt = new Date();
      user.updatedAt = new Date();
      const expectedResult: GetMyInfoResponseDto = new GetMyInfoResponseDto(user);

      userRepository.findOneUserById.mockResolvedValue(user);

      const result = await userService.getMyInfo(user.id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOneById', () => {
    it('Should return null if it cannot find user using user id', async () => {
      const userId: number = 1;

      userRepository.findOneUserById.mockResolvedValue(null);

      const result = await userService.findOneById(userId);
      expect(result).toEqual(null);
    });

    it('Should return user if it  find user using user id', async () => {
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: '12345678' });
      user.id = 1;

      userRepository.findOneUserById.mockResolvedValue(user);

      const result = await userService.findOneById(user.id);
      expect(result).toEqual(user);
    });
  });

  describe('softDeleteUser', () => {
    it('Should throw NotFoundException if it cannot find user using user id', async () => {
      userRepository.findOneUserById.mockResolvedValue(null);
      await expect(userService.softDeleteUser(1)).rejects.toThrow(NotFoundException);
    });
    it('Should return undefined if a user is deleted using a id of the user', async () => {
      const user: User = new User({ nickName: 'tester', email: 'user@email.com', password: '12345678' });
      user.id = 1;

      const workoutLog = new WorkoutLog({
        setCount: 1,
        weight: 10,
        repeatCount: 15,
        exercise: new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'Dead lift' }),
        user: user,
      });
      workoutLog.id = 1;
      workoutLog.createdAt = new Date();
      workoutLog.updatedAt = new Date();

      const WorkoutLogResponse = new WorkoutLogResponseDto(workoutLog);

      const routine = new Routine({
        name: 'test',
        user,
        exercise: new Exercise({ bodyPart: BodyPart.BACK, exerciseName: 'Dead lift' }),
      });
      routine.id = 1;
      const GetAllRoutineByUserResponse = new GetAllRoutineByUserResponseDto(routine);

      userRepository.findOneUserById.mockResolvedValue(user);
      workoutLogService.findWorkoutLogsByUser.mockResolvedValue([WorkoutLogResponse]);
      workoutLogService.softDeleteWorkoutLogs.mockResolvedValue(undefined);
      routineService.findAllRoutinesByUserId.mockResolvedValue([GetAllRoutineByUserResponse]);
      routineService.softDeleteRoutines.mockResolvedValue(undefined);

      const result = await userService.softDeleteUser(user.id);
      expect(result).toEqual(undefined);
    });
  });
});
