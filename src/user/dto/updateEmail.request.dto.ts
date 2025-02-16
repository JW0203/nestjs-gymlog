import { IsNotEmpty } from 'class-validator';
import { IsEmailCustom } from '../../common/validation/isEmail.validation.custom';

export class UpdateEmailRequestDto {
  @IsNotEmpty()
  @IsEmailCustom()
  email: string;
}
