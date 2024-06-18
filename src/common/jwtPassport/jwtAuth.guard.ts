import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('Header에 토큰을 넣어야 합니다.', 'SHOULD_INSERT_TOKEN');
    }

    if (info?.message === 'jwt expired') {
      throw new UnauthorizedException('민료된 토큰입니다.', 'EXPIRED_TOKEN');
    }

    if (info?.message === 'jwt malformed') {
      throw new UnauthorizedException('적절하지 않은 토큰입니다.', 'INVALID_TOKEN');
    }

    if (info) {
      throw new UnauthorizedException(info.message, 'TOKEN_ERROR');
    }

    if (err) {
      throw err;
    }

    return user;
  }
}
