import { forwardRef, Module } from '@nestjs/common';
import { User } from '../domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../presentation/user.controller';
import { UserService } from './user.service';
import { AuthModule } from '../../auth/application/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
