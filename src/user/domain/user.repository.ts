import { User } from './User.entity';

export interface UserRepository {
  signUp(newUserEntity: User): Promise<User>;
}
