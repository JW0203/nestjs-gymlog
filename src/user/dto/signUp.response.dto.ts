import { IsInt, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
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
  @Matches(/^[A-Za-z0-9]+$/)
  name: string;

  constructor(params: { id: number; email: string; name: string }) {
    this.id = params.id;
    this.email = params.email;
    this.name = params.name;
  }
}
