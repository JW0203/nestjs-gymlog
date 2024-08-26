import { UserRepository } from '../domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';

export class TypeormUserRepository implements UserRepository {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}

  async findOneByEmailLockMode(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email }, lock: { mode: 'pessimistic_write' } });
  }
  async signUp(newUserEntity: User): Promise<User> {
    return await this.userRepository.save(newUserEntity);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async softDeleteUser(userId: number): Promise<void> {
    await this.userRepository.softDelete(userId);
  }
}
