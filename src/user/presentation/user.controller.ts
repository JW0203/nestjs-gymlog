import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { User } from '../domain/User.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  signUp(@Body() user: User) {
    return this.userService.signUp(user);
  }
}
