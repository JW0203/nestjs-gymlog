import { IsString } from 'class-validator';

export class SignInResponseDto {
  @IsString()
  accessToken: string;
  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }
}
