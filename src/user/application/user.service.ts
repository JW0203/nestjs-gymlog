import { Inject, Injectable } from '@nestjs/common';
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
    const newUserEntity = new User(signUpRequestDto);
    await this.userRepository.signUp(newUserEntity);
  }
}
