import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { NoWhitespace } from '../../common/validation/NoWhitespace.validation';
import { IsEmailCustom } from '../../common/validation/isEmailValidation.custom';

export class SignUpRequestDto {
  @IsEmailCustom()
  email: string;

  @IsNotEmpty()
  @NoWhitespace()
  @MinLength(8)
  @MaxLength(15)
  password: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[A-Za-z0-9]+$/)
  name: string;
}
