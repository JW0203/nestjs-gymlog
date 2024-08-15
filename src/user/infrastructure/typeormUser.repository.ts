import { UserRepository } from '../domain/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import * as bcrypt from 'bcrypt';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { Transactional } from 'typeorm-transactional';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { BadRequestException } from '@nestjs/common';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';

export class TypeormUserRepository implements UserRepository {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { password, email, name } = signUpRequestDto;
    const user = await this.userRepository.findOne({ where: { email }, lock: { mode: 'pessimistic_write' } });
    if (user) {
      throw new Error('Email already exists');
    }
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUserEntity = new User({ name, email, password: hashedPassword });

    const newUser = await this.userRepository.save(newUserEntity);
    return new SignUpResponseDto({ ...newUser });
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = signInRequestDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new BadRequestException('The email does not exist');
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new BadRequestException('The password does not match');
    }
    const accessToken = this.authService.signInWithJWT({ userId: user.id });
    return new SignInResponseDto(accessToken);
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }

  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new BadRequestException('The user does not exist');
    }
    return new GetMyInfoResponseDto({ ...user });
  }

  async softDeleteUser(userId: number): Promise<any> {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new BadRequestException('The user does not exist');
    }
    await this.userRepository.softDelete(userId);
  }
}
