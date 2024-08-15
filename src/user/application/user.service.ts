import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/User.entity';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { USER_REPOSITORY } from '../../common/const/inject.constant';
import { UserRepository } from '../domain/user.repository';
import { SignUpResponseDto } from '../dto/signUp.response.dto';

@Injectable()
export class UserService {
  constructor(@Inject(USER_REPOSITORY) readonly userRepository: UserRepository) {}

  async signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    return this.userRepository.signUp(signUpRequestDto);
  }

  async signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto> {
    return await this.userRepository.signIn(signInRequestDto);
  }

  async findOneById(id: number): Promise<User | null> {
    return await this.userRepository.findOneById(id);
  }

  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    return await this.userRepository.getMyInfo(userId);
  }

  async deleteUser(userId: number) {
    await this.userRepository.softDeleteUser(userId);
  }
}
