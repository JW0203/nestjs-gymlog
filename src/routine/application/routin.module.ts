import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routine } from '../domain/Routine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routine])],
})
export class RoutineModule {}
