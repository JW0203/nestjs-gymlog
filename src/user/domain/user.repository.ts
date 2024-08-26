import { User } from './User.entity';

export interface UserRepository {
  signUp(newUserEntity: User): Promise<User>;
  findOneById(id: number): Promise<User | null>;
  softDeleteUser(userId: number): Promise<void>;
  findOneByEmailLockMode(email: string): Promise<User | null>;
  findOneByEmail(email: string): Promise<User | null>;
}
