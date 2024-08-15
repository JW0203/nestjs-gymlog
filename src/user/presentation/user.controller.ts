import { Body, Controller, Get, Post, UseGuards, Request, Delete, HttpCode } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';
import { SignUpRequestDto } from '../dto/signUp.request.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  signUp(@Body() signUpRequestDto: SignUpRequestDto) {
    return this.userService.signUp(signUpRequestDto);
  }

  @Get()
  @HttpCode(200)
  signIn(@Body() signInRequestDto: SignInRequestDto) {
    return this.userService.signIn(signInRequestDto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getMyInfo(@Request() req: any) {
    return this.userService.getMyInfo(req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  deleteMyInfo(@Request() req: any) {
    return this.userService.deleteUser(req.user.id);
  }
}
