import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { NoWhitespace } from '../../common/validation/NoWhitespace.validation';
import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';

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
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  nickName: string;
}
