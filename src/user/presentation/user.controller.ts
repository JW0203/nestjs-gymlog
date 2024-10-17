import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    return this.userService.signUp(signUpRequestDto);
  }
}
