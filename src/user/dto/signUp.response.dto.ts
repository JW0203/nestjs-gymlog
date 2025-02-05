import { IsInt, IsNotEmpty, Matches, MaxLength, MinLength, validateOrReject } from 'class-validator';
import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';

export class SignUpResponseDto {
  @IsNotEmpty()
  @IsInt()
  id: number;

  @IsEmailCustom()
  email: string;

  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(15)
  @Matches(/^[a-zA-Z\uAC00-\uD7A3][a-zA-Z0-9\uAC00-\uD7A3]*$/) //문자는 영어나 한글로 시작하고 공백을 허용하지 않는다.,
  nickName: string;

  constructor(params: { id: number; email: string; nickName: string }) {
    this.id = params.id;
    this.email = params.email;
    this.nickName = params.nickName;

    validateOrReject(this).catch((error) => console.log('SignUpResponseDto validation failed', error));
  }
}
