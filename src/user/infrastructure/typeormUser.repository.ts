import { UserRepository } from '../domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';

export class TypeormUserRepository implements UserRepository {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async signUp(newUserEntity: User): Promise<User> {
    return await this.userRepository.save(newUserEntity);
  }

  async findOneUserByEmailLockMode(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email }, lock: { mode: 'pessimistic_write' } });
  }

  async findOneUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
