import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from './domain/WorkoutLog.entity';
import { ExerciseModule } from '../excercise/excercise.module';
import { WorkoutLogController } from './presentation/workoutLog.controller';
import { UserModule } from '../user/user.module';
import { WorkoutLogService } from './application/workoutLog.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLog]), ExerciseModule, UserModule],
  controllers: [WorkoutLogController],
  providers: [WorkoutLogService],
})
export class WorkoutLogModule {}
