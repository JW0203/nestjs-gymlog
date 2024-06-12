import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { User } from '../domain/User.entity';
import { SignInRequestDto } from '../dto/signIn.request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  signUp(@Body() user: User) {
    return this.userService.signUp(user);
  }

  @Get()
  signIn(@Body() signInRequestDto: SignInRequestDto) {
    return this.userService.signIn(signInRequestDto);
  }
}
