import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { IORedis_KEY } from './radis.constant';
import { BestWorkoutLog } from '../workoutLog/dto/findBestWorkoutLogs.response.dto';

@Injectable()
export class RedisService {
  constructor(
    @Inject(IORedis_KEY)
    private readonly redisClient: Redis,
  ) {}

  async getKeys(pattern?: string): Promise<string[]> {
    const searchPattern = pattern ? pattern : '*';
    return this.redisClient.keys(searchPattern);
  }

  async insert(key: string, value: any): Promise<void> {
    const valueType = typeof value;
    const setValue = valueType === 'object' ? value : JSON.stringify(value);
    await this.redisClient.set(key, setValue);
  }

  async get(key: string): Promise<string | null> {
    const data = await this.redisClient.get(key);
    if (!data) {
      return null;
    }

    return data;
  }

  async insertBestWorkout(key: string, value: BestWorkoutLog[]): Promise<void> {
    const setValue = JSON.stringify(value);
    await this.redisClient.set(key, setValue);
  }

  async getBestWorkoutLogs(key: string): Promise<BestWorkoutLog[]> {
    const data = await this.redisClient.get(key);
    if (!data) return [];

    try {
      const parsedData = JSON.parse(data);
      return parsedData;
    } catch (e) {
      return [];
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }
}
