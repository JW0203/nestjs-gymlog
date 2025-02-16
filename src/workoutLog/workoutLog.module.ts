import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from './domain/WorkoutLog.entity';
import { ExerciseModule } from '../exercise/excercise.module';
import { WorkoutLogController } from './presentation/workoutLog.controller';
import { UserModule } from '../user/user.module';
import { WorkoutLogService } from './application/workoutLog.service';
import { LoggerModule } from '../common/Logger/logger.module';
import { WORKOUTLOG_REPOSITORY } from '../common/const/inject.constant';
import { TypeormWorkoutLogRepository } from './infrastructure/typeormWorkoutLog.repository';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLog]),
    forwardRef(() => ExerciseModule),
    forwardRef(() => UserModule),
    LoggerModule,
    CacheModule.register(),
  ],
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService, { provide: WORKOUTLOG_REPOSITORY, useClass: TypeormWorkoutLogRepository }],
  exports: [WorkoutLogService],
})
export class WorkoutLogModule {}
