import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './domain/Routine.entity';
import { RoutineService } from './application/routine.service';
import { ExerciseModule } from '../excercise/excercise.module';
import { RoutineToExerciseModule } from '../routineToExercise/routineToExercise.module';
import { UserModule } from '../user/user.module';
import { RoutineController } from './presentation/routine.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Routine]), ExerciseModule, RoutineToExerciseModule, UserModule],
  providers: [RoutineService],
  controllers: [RoutineController],
})
export class RoutineModule {}
