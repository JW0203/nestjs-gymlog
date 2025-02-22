import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.checkRedisConnection();
  }

  async setCache(key: string, value: any): Promise<void> {
    return await this.cacheManager.set(key, value);
  }

  async getCache(key: string): Promise<any> {
    const data = await this.cacheManager.get(key);
    return data;
  }

  async deleteCache(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  private async checkRedisConnection() {
    try {
      // Redis에 테스트 키 설정
      await this.cacheManager.set('test:connection', 'connected', 60);
      const result = await this.cacheManager.get('test:connection');
      console.log('Redis connection test:', result); // "connected" 출력 확인
    } catch (error) {
      console.error('Redis connection failed:', error);
    }
  }
}
