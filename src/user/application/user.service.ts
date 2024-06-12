import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from '../dto/signIn.request.dto';

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
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUser = new User({ ...results, password: hashedPassword });
    return await this.userRepository.save(newUser);
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<object> {
    const { email, password } = signInRequestDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (user === null || user === undefined) {
      throw new BadRequestException('The email does not exist');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('The password does not match');
    }
    return { result: 'login successfully' };
  }
}
