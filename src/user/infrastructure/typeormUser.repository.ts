import { UserRepository } from '../domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

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

  async findOneUserById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async softDeleteUser(userId: number): Promise<void> {
    await this.userRepository.softDelete(userId);
  }

  async updateEmail(userId: number, email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new ConflictException('The user does not exist');
    }
    user.email = email;
    await this.userRepository.save(user);
  }
}
