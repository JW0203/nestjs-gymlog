import { IsInt } from 'class-validator';
import { IsEmailCustom } from '../validation/isEmail.validation.custom';
import { User } from '../../user/domain/User.entity';

export class UserDataResponseDto {
  @IsInt()
  id: number;

  @IsEmailCustom()
  email: string;

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
  }
}
