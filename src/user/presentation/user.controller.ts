import { Body, Controller, Get, Post, UseGuards, Request, Delete } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { User } from '../domain/User.entity';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';

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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyInfo(@Request() req: any) {
    console.log(req.user.values);
    return this.userService.getMyInfo(req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteMyInfo(@Request() req: any) {
    return this.userService.deleteUser(req.user.id);
  }
}
