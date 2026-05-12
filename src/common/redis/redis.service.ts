import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class RedisService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async onModuleInit() {
    try {
      await this.cacheManager.set('redis_test_connection', 'ok', 5000);
      const test = await this.cacheManager.get('redis_test_connection');
      if (test === 'ok') {
        console.log('[REDIS CACHE] Connected successfully!');
      } else {
        console.log('[REDIS CACHE] Connected but test value mismatch.');
      }
    } catch (error) {
      console.error('[REDIS CACHE] Connection error:', error.message);
    }
  }

  // Bạn có thể thêm các method tiện ích dùng chung cho Redis ở đây
  async setCache(key: string, value: any, ttl?: number) {
    await this.cacheManager.set(key, value, ttl);
  }

  async getCache<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }

  async deleteCache(key: string) {
    await this.cacheManager.del(key);
  }
}
