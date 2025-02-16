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
import { MaxWeightPerExerciseModule } from '../maxWeightPerExercise/maxWeightPerExercise.module';
import { MaxWeightPerExercise } from '../maxWeightPerExercise/domain/MaxWeightPerExercise.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLog, MaxWeightPerExercise]),
    forwardRef(() => ExerciseModule),
    forwardRef(() => UserModule),
    forwardRef(() => MaxWeightPerExerciseModule),
    LoggerModule,
  ],
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService, { provide: WORKOUTLOG_REPOSITORY, useClass: TypeormWorkoutLogRepository }],
  exports: [WorkoutLogService],
})
export class WorkoutLogModule {}
