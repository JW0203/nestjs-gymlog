import { DataSource } from 'typeorm';
import { User } from '../../src/user/domain/User.entity';

export async function createTestUser(dataSource: DataSource, overrides: Partial<User> = {}) {
  const userRepository = dataSource.getRepository(User);
  const baseUser = {
    email: 'test-user@email.com',
    password: '123456',
    nickName: 'myNickName',
    ...overrides,
  };
  const user = userRepository.create(baseUser);

  return await userRepository.save(user);
}
