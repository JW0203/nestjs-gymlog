import { Module } from '@nestjs/common';
import { User } from './domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './presentation/user.controller';
import { UserService } from './application/user.service';
import { AuthModule } from '../auth/application/auth.module';
import { USER_REPOSITORY } from '../common/const/inject.constant';
import { TypeormUserRepository } from './infrastructure/typeormUser.repository';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService, { provide: USER_REPOSITORY, useClass: TypeormUserRepository }],
  exports: [UserService],
})
export class UserModule {}
