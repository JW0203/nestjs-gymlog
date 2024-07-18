import { IsDate, IsInt, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';

export class GetMyInfoResponseDto {
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

  @IsNotEmpty()
  @IsDate()
  createdAt: Date;

  @IsNotEmpty()
  @IsDate()
  updatedAt: Date;

  constructor(params: { id: number; email: string; name: string; createdAt: Date; updatedAt: Date }) {
    if (params) {
      this.id = params.id;
      this.email = params.email;
      this.name = params.name;
      this.createdAt = params.createdAt;
      this.updatedAt = params.updatedAt;
    }
  }
}
