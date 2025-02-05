import { Body, Controller, Get, HttpCode, Post, UseGuards, Request, Delete } from '@nestjs/common';
import { UserService } from '../application/user.service';
import { SignUpRequestDto } from '../dto/signUp.request.dto';
import { SignInRequestDto } from '../dto/signIn.request.dto';
import { JwtAuthGuard } from '../../common/jwtPassport/jwtAuth.guard';

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

  @Get()
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  getMyInfo(@Request() req: any) {
    return this.userService.getMyInfo(req.user.id);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  softDeleteUser(@Request() req: any) {
    return this.userService.softDeleteUser(req.user.id);
  }

  @Post('email-update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  updateEmail(@Body() email: { email: string }, @Request() req: any) {
    return this.userService.updateEmail(req.user.id, email);
  }
}
