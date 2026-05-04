import { Global, Module, OnModuleInit, Inject } from '@nestjs/common';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { REDIS_URL } from '../constants/app.constant';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { KeyvCacheableMemory } from 'cacheable';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new Keyv({
              store: new KeyvCacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis(REDIS_URL || 'redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule implements OnModuleInit {

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
}
