import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { RedisCacheService } from './redisCache.service';

@Global()
@Module({
  imports: [
    CacheModule.register({
      ttl: 600,
      store: redisStore,
      host: 'localhost',
      port: 6379,
      isGlobal: true,
      redisOptions: { showFriendlyErrorStack: true },
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
