import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInRequestDto } from '../dto/signIn.request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    return this.userService.signUp(signUpRequestDto);
  }

  @Post('sign-in')
  @HttpCode(200)
  signIn(@Body() signInRequestDto: SignInRequestDto) {
    return this.userService.signIn(signInRequestDto);
  }
}
