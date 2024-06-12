import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkoutLog } from '../domain/WorkoutLog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkoutLog])],
})
export class WorkoutLogModule {}
