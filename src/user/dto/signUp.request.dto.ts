import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { NoWhitespace } from '../../common/NoWhitespace.validation';
import { IsEmailCustom } from '../../common/isEmailValidation.custom';

export class SignUpRequestDto {
  @IsEmailCustom()
  email: string;

  @IsNotEmpty()
  @NoWhitespace()
  @MinLength(8)
  @MaxLength(15)
  password: string;

  name: string;
}
