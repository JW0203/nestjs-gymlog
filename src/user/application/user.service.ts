import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/User.entity';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { USER_REPOSITORY } from '../../common/const/inject.constant';
import { UserRepository } from '../domain/user.repository';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { Transactional } from 'typeorm-transactional';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { password, email, name } = signUpRequestDto;
    const user = await this.userRepository.findOneByEmailLockMode(email);
    if (user) {
      throw new Error('Email already exists');
    }
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUserEntity = new User({ name, email, password: hashedPassword });

    const newUser = await this.userRepository.signUp(newUserEntity);
    return new SignUpResponseDto({ ...newUser });
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    const { email, password } = signInRequestDto;
    const user = await this.userRepository.findOneByEmail(email);
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
    return await this.userRepository.findOneById(id);
  }

  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    const user = await this.userRepository.findOneById(userId);
    if (!user) {
      throw new BadRequestException('The user does not exist');
    }
    return new GetMyInfoResponseDto({ ...user });
  }

  async deleteUser(userId: number) {
    const user = await this.findOneById(userId);
    if (!user) {
      throw new BadRequestException('The user does not exist');
    }
    await this.userRepository.softDeleteUser(userId);
  }
}
