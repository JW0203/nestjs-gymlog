import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from '../common/Logger/logger.module';
import { Max_Weight_PerExercise_REPOSITORY } from '../common/const/inject.constant';
import { MaxWeightPerExercise } from './domain/MaxWeightPerExercise.entity';
import { TypeormMaxWeightPerExerciseRepository } from './infrastructure/typeormMaxWeightPerExercise.repository';
import { MaxWeightPerExerciseService } from './application/maxWeightPerExercise.service';
import { WorkoutLogModule } from '../workoutLog/workoutLog.module';
import { WorkoutLog } from '../workoutLog/domain/WorkoutLog.entity';
import { MaxWeightPerExerciseController } from './presentation/maxWeightPerExercise.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MaxWeightPerExercise, WorkoutLog]),
    LoggerModule,
    forwardRef(() => WorkoutLogModule),
  ],
  providers: [
    MaxWeightPerExerciseService,
    { provide: Max_Weight_PerExercise_REPOSITORY, useClass: TypeormMaxWeightPerExerciseRepository },
  ],
  controllers: [MaxWeightPerExerciseController],
  exports: [MaxWeightPerExerciseService],
})
export class MaxWeightPerExerciseModule {}
