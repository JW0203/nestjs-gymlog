import { User } from './User.entity';

export interface UserRepository {
  signUp(newUserEntity: User): Promise<User>;
  findOneUserByEmailLockMode(email: string): Promise<User | null>;
  findOneUserByEmail(email: string): Promise<User | null>;
}
