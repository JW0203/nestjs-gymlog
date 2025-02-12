import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateUserNickNameInMaxWeightRequestDto {
  @IsNotEmpty()
  @IsString()
  newNickName: string;

  @IsNotEmpty()
  @IsString()
  oldNickName: string;

  constructor(params: { newNickName: string; oldNickName: string }) {
    if (params) {
      this.newNickName = params.newNickName;
      this.oldNickName = params.oldNickName;
    }
  }
}
