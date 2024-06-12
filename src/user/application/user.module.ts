import { Module } from '@nestjs/common';
import { User } from '../domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../presentation/user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
