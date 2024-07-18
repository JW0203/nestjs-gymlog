import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';
import { IsInt, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';

export class UserResponseDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsEmailCustom()
  email: string;

  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[A-Za-z0-9]+$/)
  name: string;

  constructor(params: { id: number; email: string; name: string }) {
    if (params) {
      this.id = params.id;
      this.email = params.email;
      this.name = params.name;
    }
  }
}
