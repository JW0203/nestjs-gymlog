import { UserRepository } from '../domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';

export class TypeormUserRepository implements UserRepository {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {}
}
