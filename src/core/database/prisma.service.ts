import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../common/prisma/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const databaseUrl = configService.get<string>('DATABASE_URL') || configService.get<string>('database.url');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    } as any);
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ [PRISMA] Đã kết nối thành công tới PostgreSQL (Supabase).');
    } catch (error) {
      console.error('❌ [PRISMA] Không thể kết nối tới database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
