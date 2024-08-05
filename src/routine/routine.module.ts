import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './domain/Routine.entity';
import { RoutineService } from './application/routine.service';
import { ExerciseModule } from '../excercise/excercise.module';
import { UserModule } from '../user/user.module';
import { RoutineController } from './presentation/routine.controller';
import { LoggerModule } from '../common/Logger/logger.module';

@Module({
  imports: [TypeOrmModule.forFeature([Routine]), ExerciseModule, UserModule, LoggerModule],
  providers: [RoutineService],
  controllers: [RoutineController],
})
export class RoutineModule {}
