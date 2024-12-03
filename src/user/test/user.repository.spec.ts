import { UserRepository } from '../domain/user.repository';
import { User } from '../domain/User.entity';

const mockUserRepository: jest.Mocked<UserRepository> = {
  signUp: jest.fn(),
  findOneUserByEmailLockMode: jest.fn(),
  findOneUserByEmail: jest.fn(),
  findOneUserById: jest.fn(),
  softDeleteUser: jest.fn(),
};

describe('Test UserRepository', () => {
  let userRepository: jest.Mocked<UserRepository>;
  beforeEach(async () => {
    userRepository = mockUserRepository;
  });

  describe('signUp', () => {
    it('Should sign up a new user', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;
      userRepository.signUp.mockResolvedValue(newUser);

      const result = await userRepository.signUp(newUser);

      expect(result).toEqual(newUser);
      expect(userRepository.signUp).toHaveBeenCalledWith(newUser);
    });
  });

  describe('findOneUserByEmailLockMode', () => {
    it('Should fine one user by the user email', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;
      userRepository.findOneUserByEmailLockMode.mockResolvedValue(newUser);

      const result = await userRepository.findOneUserByEmailLockMode(newUser.email);

      expect(result).toEqual(newUser);
      expect(userRepository.findOneUserByEmailLockMode).toHaveBeenCalledWith(newUser.email);
    });
  });

  it('Should return null when a user email is not exist', async () => {
    userRepository.findOneUserByEmailLockMode.mockResolvedValue(null);
    const result = await userRepository.findOneUserByEmailLockMode('notexist@email.com');
    expect(result).toEqual(null);
    expect(userRepository.findOneUserByEmailLockMode).toHaveBeenCalledWith('notexist@email.com');
  });

  describe('findOneUserByEmail', () => {
    it('Should fine one user by the user email', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: 'tester', password: 'test1234' });
      newUser.id = 1;
      userRepository.findOneUserByEmail.mockResolvedValue(newUser);

      const result = await userRepository.findOneUserByEmail(newUser.email);

      expect(result).toEqual(newUser);
      expect(userRepository.findOneUserByEmail).toHaveBeenCalledWith(newUser.email);
    });
  });

  it('Should return null when a user email is not exist', async () => {
    userRepository.findOneUserByEmail.mockResolvedValue(null);

    const result = await userRepository.findOneUserByEmail('notexist@email.com');

    expect(result).toEqual(null);
    expect(userRepository.findOneUserByEmail).toHaveBeenCalledWith('notexist@email.com');
  });

  describe('findOneUserById', () => {
    it('Should fine one user by the user email', async () => {
      const newUser: User = new User({ email: 'test@example.com', name: '테스터', password: 'test1234' });
      newUser.id = 1;
      userRepository.findOneUserById.mockResolvedValue(newUser);

      const result = await userRepository.findOneUserById(newUser.id);

      expect(result).toEqual(newUser);
      expect(userRepository.findOneUserById).toHaveBeenCalledWith(newUser.id);
    });
  });

  it('Should return null when a user id is not exist', async () => {
    userRepository.findOneUserById.mockResolvedValue(null);

    const result = await userRepository.findOneUserById(999);

    expect(result).toEqual(null);
    expect(userRepository.findOneUserById).toHaveBeenCalledWith(999);
  });

  describe('softDeleteUser', () => {
    it('Should use userId', async () => {
      const userId: number = 1;

      await userRepository.softDeleteUser(userId);

      expect(userRepository.softDeleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
