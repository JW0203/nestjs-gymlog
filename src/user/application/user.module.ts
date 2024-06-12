import { Module } from '@nestjs/common';
import { User } from '../domain/User.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
})
export class UserModule {}
