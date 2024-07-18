import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/User.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { AuthService } from '../../auth/application/auth.service';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { password, email, name } = signUpRequestDto;
    const foundUser = await this.userRepository.findOne({ where: { email } });
    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));
    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await this.userRepository.save(newUser);
    return new SignUpResponseDto({ ...savedUser });
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

  async findOneById(id: number) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }
  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    const user = await this.findOneById(userId);
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
    await this.userRepository.softDelete(userId);
  }
}
