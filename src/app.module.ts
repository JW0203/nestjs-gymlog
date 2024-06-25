import * as dotenv from 'dotenv';
dotenv.config();
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { UserModule } from './user/user.module';
import { RoutineModule } from './routine/routine.module';
import { WorkoutLogModule } from './workoutLog/application/workoutLog.module';
import { ExerciseModule } from './excercise/excercise.module';
import { WorkoutLogToExerciseModule } from './workoutLogToExercise/application/workoutLogToExercise.module';
import { JwtPassportModule } from './common/jwtPassport.module';
import { RoutineToExerciseModule } from './routineToExercise/routineToExercise.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'local', 'debug').default('local'),
      }),
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_HOST'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: true,
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
    UserModule,
    RoutineModule,
    WorkoutLogModule,
    ExerciseModule,
    WorkoutLogToExerciseModule,
    JwtPassportModule,
    RoutineToExerciseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
