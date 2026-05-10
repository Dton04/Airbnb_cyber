import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '../constants/app.constant';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: DATABASE_URL });
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