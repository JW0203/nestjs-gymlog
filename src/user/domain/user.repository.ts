import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { SignInResponseDto } from '../dto/signIn.response.dto';
import { User } from './User.entity';
import { SignUpResponseDto } from '../dto/signUp.response.dto';
import { GetMyInfoResponseDto } from '../dto/getMyInfo.response.dto';

export interface UserRepository {
  signUp(signUpRequestDto: SignUpRequestDto): Promise<SignUpResponseDto>;
  signIn(signInRequestDto: SignInRequestDto): Promise<SignInResponseDto>;
  findOneById(id: number): Promise<User | null>;
  getMyInfo(userId: number): Promise<GetMyInfoResponseDto>;
  softDeleteUser(userId: number): Promise<any>;
}
