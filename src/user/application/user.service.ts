import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../common/const/inject.constant';
import { UserRepository } from '../domain/user.repository';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/application/auth.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { Transactional } from 'typeorm-transactional';
import { User } from '../domain/User.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY) readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Transactional()
  async signUp(signUpRequestDto: SignUpRequestDto): Promise<any> {
    const user = await this.userRepository.findOneUserByEmailLockMode(signUpRequestDto.email);
    if (user) {
      throw new ConflictException('User not found');
    }
    const newUserEntity = new User(signUpRequestDto);
    return await this.userRepository.signUp(newUserEntity);
  }
}
