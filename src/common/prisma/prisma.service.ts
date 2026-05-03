import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { DATABASE_URL } from '../constants/app.constant';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const url = new URL(DATABASE_URL!);

    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port),
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      allowPublicKeyRetrieval: true,
      ssl: false,
    });
    super({ adapter });
  }

  async onModuleInit() {
    try {
      await this.$queryRaw`SELECT 1+1 AS result`;
      console.log('[PRISMA] Connection has been established successfully.');
    } catch (error) {
      console.error(' Unable to connect to the database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
