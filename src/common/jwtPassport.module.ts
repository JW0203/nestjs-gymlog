import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwtPassport/jwt.strategy';

@Module({
  imports: [PassportModule, UserModule],
  providers: [JwtStrategy],
})
export class JwtPassportModule {}
