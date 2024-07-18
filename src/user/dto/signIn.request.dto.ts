import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { NoWhitespace } from '../../common/validation/NoWhitespace.validation';

export class SignInRequestDto {
  @IsEmailCustom()
  email: string;

  @IsNotEmpty()
  @NoWhitespace()
  @MinLength(8)
  @MaxLength(15)
  password: string;
}
