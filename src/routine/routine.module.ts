import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from './domain/Routine.entity';
import { RoutineService } from './application/routine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Routine])],
  providers: [RoutineService],
})
export class RoutineModule {}
