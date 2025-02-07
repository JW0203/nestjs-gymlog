import { IsNotEmpty, IsNumber, IsString, validateOrReject } from 'class-validator';

export class UpdateUserNickNameInWorkOutLogRequestDto {
  @IsNotEmpty()
  @IsString()
  nickName: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  constructor(params: { nickName: string; userId: number }) {
    if (params) {
      this.nickName = params.nickName;
      this.userId = params.userId;

      validateOrReject(this).catch((errors) => {
        console.log('(UpdateUserNickNameRequest validation failed) Errors:', errors);
      });
    }
  }
}
