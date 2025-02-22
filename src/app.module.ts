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
import { WorkoutLogModule } from './workoutLog/workoutLog.module';
import { ExerciseModule } from './exercise/excercise.module';
import { JwtPassportModule } from './common/jwtPassport.module';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { MaxWeightPerExerciseModule } from './maxWeightPerExercise/maxWeightPerExercise.module';
import { CacheModule } from '@nestjs/cache-manager';
// import { redisStore } from 'cache-manager-redis-store';
import * as redisStore from 'cache-manager-redis-store';
// import { RedisCacheModule } from './cache/redisCache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'local', 'debug', 'e2e').default('local'),
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
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
        namingStrategy: new SnakeNamingStrategy(),
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    UserModule,
    RoutineModule,
    WorkoutLogModule,
    ExerciseModule,
    JwtPassportModule,
    MaxWeightPerExerciseModule,
    CacheModule.register({
      ttl: 60,
      store: redisStore,
      host: '172.27.0.2',
      port: 6379,
      isGlobal: true,
      redisOptions: { showFriendlyErrorStack: true },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
