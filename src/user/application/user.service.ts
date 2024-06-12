import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async signUp(user: User): Promise<User> {
    const { password, ...results } = user;
    const hashingPassword: string = await bcrypt.hash(
      password,
      this.configService.get<number>('SALT_ROUNDS') as number,
    );
    const newUser = new User({ ...results, password: hashingPassword });
    return await this.userRepository.save(newUser);
  }
}
