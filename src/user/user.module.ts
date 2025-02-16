import { forwardRef, Module } from '@nestjs/common';
import { User } from './domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './presentation/user.controller';
import { UserService } from './application/user.service';
import { AuthModule } from '../auth/application/auth.module';
import { PASSWORD_HASHER, USER_REPOSITORY } from '../common/const/inject.constant';
import { TypeormUserRepository } from './infrastructure/typeormUser.repository';
import { BycptHasher } from './application/bcryptHasher.service';
import { MaxWeightPerExerciseModule } from '../maxWeightPerExercise/maxWeightPerExercise.module';
import { WorkoutLogModule } from '../workoutLog/workoutLog.module';
import { RoutineModule } from '../routine/routine.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    forwardRef(() => MaxWeightPerExerciseModule),
    forwardRef(() => WorkoutLogModule),
    forwardRef(() => RoutineModule),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    { provide: USER_REPOSITORY, useClass: TypeormUserRepository },
    { provide: PASSWORD_HASHER, useClass: BycptHasher },
  ],
  exports: [UserService],
})
export class UserModule {}
