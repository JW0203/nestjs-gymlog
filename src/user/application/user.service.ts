import { ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../../common/const/inject.constant';
import { UserRepository } from '../domain/user.repository';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { Transactional } from 'typeorm-transactional';
import { User } from '../domain/User.entity';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';
import { PasswordHasher } from '../domain/passwordHasher.interface';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) readonly userRepository: UserRepository,
    @Inject(PASSWORD_HASHER) readonly passwordHasher: PasswordHasher,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<any> {
    const { email, name, password } = signUpRequestDto;
    const user = await this.userRepository.findOneUserByEmailLockMode(email);
    if (user) {
      throw new ConflictException('The email is already in use');
    }
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }

    const hashedPassword = await this.passwordHasher.hash(password, parseInt(saltRounds));

    const newUserEntity = new User({ name, email, password: hashedPassword });
    const newUser = await this.userRepository.signUp(newUserEntity);
    return new SignUpResponseDto({ ...newUser });
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<any> {
    const { email, password } = signInRequestDto;
    const user = await this.userRepository.findOneUserByEmail(email);
    if (!user) {
      throw new NotFoundException('The email does not exist');
    }
    const passwordMatch = await this.passwordHasher.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('The password does not match');
    }
    const accessToken = this.authService.signInWithJWT({ userId: user.id });
    return new SignInResponseDto(accessToken);
  }

  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    const user = await this.userRepository.findOneUserById(userId);
    if (!user) {
      throw new NotFoundException('The user does not exist');
    }
    return new GetMyInfoResponseDto({ ...user });
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOneUserById(id);
  }

  async softDeleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOneUserById(userId);
    if (!user) {
      throw new NotFoundException('The user does not exist');
    }
    await this.userRepository.softDeleteUser(userId);
  }
}
