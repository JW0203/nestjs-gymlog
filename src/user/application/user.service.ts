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
    // const salt: number = parseInt(this.configService.get<number>('SALT_ROUNDS') as string);

    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    console.log(typeof saltRounds);
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUser = new User({ ...results, password: hashedPassword });
    return await this.userRepository.save(newUser);
  }
}
