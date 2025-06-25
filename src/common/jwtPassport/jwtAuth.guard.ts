import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any) {
    if (info?.message === 'No auth token') {
      throw new UnauthorizedException('SHOULD_INSERT_TOKEN_TO_HEADER');
    }

    if (info?.message === 'jwt expired') {
      throw new UnauthorizedException('EXPIRED_TOKEN');
    }

    if (info?.message === 'jwt malformed') {
      throw new UnauthorizedException('INVALID_TOKEN');
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
