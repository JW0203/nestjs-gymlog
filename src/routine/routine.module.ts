import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './domain/Routine.entity';
import { RoutineService } from './application/routine.service';
import { ExerciseModule } from '../exercise/excercise.module';
import { RoutineController } from './presentation/routine.controller';
import { LoggerModule } from '../common/Logger/logger.module';
import { TypeormRoutineRepository } from './infrastructure/typeormRoutine.repository';
import { ROUTINE_REPOSITORY } from '../common/const/inject.constant';

@Module({
  imports: [TypeOrmModule.forFeature([Routine]), ExerciseModule, LoggerModule],
  providers: [RoutineService, { provide: ROUTINE_REPOSITORY, useClass: TypeormRoutineRepository }],
  controllers: [RoutineController],
  exports: [RoutineService],
})
export class RoutineModule {}
