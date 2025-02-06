import { Module } from '@nestjs/common';
import { User } from './domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './presentation/user.controller';
import { UserService } from './application/user.service';
import { AuthModule } from '../auth/application/auth.module';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../common/const/inject.constant';
import { TypeormUserRepository } from './infrastructure/typeormUser.repository';
import { BycptHasher } from './application/bcryptHasher.service';
import { UserSubscriber } from './infrastructure/typeormUser.subscriber';
import { WorkoutLog } from '../workoutLog/domain/WorkoutLog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, WorkoutLog]), AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserSubscriber,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
    { provide: PASSWORD_HASHER, useClass: BycptHasher },
  ],
  exports: [UserService],
})
export class UserModule {}
