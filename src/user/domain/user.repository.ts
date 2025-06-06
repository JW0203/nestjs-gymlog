import { User } from './User.entity';

export interface UserRepository {
  signUp(newUserEntity: User): Promise<User>;
  findOneUserByEmailLockMode(email: string): Promise<User | null>;
  findOneUserByEmail(email: string): Promise<User | null>;
  findOneUserById(id: number): Promise<User | null>;
  softDeleteUser(userId: number): Promise<void>;
  updateEmail(userId: number, email: string): Promise<void>;
  findOneUserByNickName(nickName: string): Promise<User | null>;
  updateNickName(userId: number, updateNickName: string): Promise<void>;
}
