import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../common/const/inject.constant';
import { UserRepository } from '../domain/user.repository';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { Transactional } from 'typeorm-transactional';
import { User } from '../domain/User.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<any> {
    const { email, name, password } = signUpRequestDto;
    const user = await this.userRepository.findOneUserByEmailLockMode(email);
    if (user) {
      throw new ConflictException('User not found');
    }
    const saltRounds = this.configService.get<string>('SALT_ROUNDS');
    if (saltRounds === undefined) {
      throw new Error('SALT_ROUNDS is not defined in the configuration.');
    }
    const hashedPassword = await bcrypt.hash(password, parseInt(saltRounds));

    const newUserEntity = new User({ name, email, password: hashedPassword });
    return await this.userRepository.signUp(newUserEntity);
  }
}
