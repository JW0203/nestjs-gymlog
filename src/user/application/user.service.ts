import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async signUp(user: User): Promise<SignUpResponseDto> {
    const { password, ...results } = user;
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUser = new User({ ...results, password: hashedPassword });
    const savedUser = await this.userRepository.save(newUser);
    return new SignUpResponseDto({ ...savedUser });
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
    const accessToken = this.authService.signInWithJWT({ userId: user.id });
    return { accessToken };
  }

  async findOneById(userId: string): Promise<User | null> {
    const id = parseInt(userId);
    return await this.userRepository.findOne({ where: { id } });
  }
}
