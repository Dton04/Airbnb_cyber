import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { MailerModule } from '@nestjs-modules/mailer';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config';

// Core Modules
import {
  DatabaseModule,
  CacheConfigModule,
  HttpExceptionFilter,
  LoggingInterceptor,
  ResponseSuccessInterceptor,
  ThrottlerBehindProxyGuard,
} from './core';

// Business Modules
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LocationModule } from './modules/location/location.module';
import { RoomModule } from './modules/room/room.module';
import { BookingModule } from './modules/booking/booking.module';
import { CommentModule } from './modules/comment/comment.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Throttling (Spam Prevention)
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute globally
      },
    ]),

    // BullMQ Queue Configuration
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisUrlString =
          configService.get<string>('REDIS_URL') ||
          configService.get<string>('redis.url') ||
          'redis://localhost:6379';
        const redisUrl = new URL(redisUrlString);
        const isUpstash = redisUrl.hostname.includes('upstash.io');
        const isTls = isUpstash || redisUrl.protocol === 'rediss:';
        return {
          connection: {
            host: redisUrl.hostname,
            port: Number(redisUrl.port),
            username: redisUrl.username,
            password: redisUrl.password,
            tls: isTls ? { rejectUnauthorized: false } : undefined,
            family: 0,
          },
        };
      },
    }),

    // Nodemailer Configuration
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          secure: false,
          auth: {
            user:
              configService.get<string>('EMAIL_USER') ||
              configService.get<string>('mail.user'),
            pass:
              configService.get<string>('EMAIL_PASS') ||
              configService.get<string>('mail.pass'),
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5,
        },
        defaults: {
          from: '"Airbnb Clone" <noreply@airbnb-clone.com>',
        },
      }),
    }),

    // Core
    DatabaseModule,
    CacheConfigModule,

    // Business Modules
    AuthModule,
    UserModule,
    LocationModule,
    RoomModule,
    BookingModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global Throttler Guard (Handles proxy headers correctly on Render)
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    // Global Logging Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Global Response Success Interceptor
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseSuccessInterceptor,
    },
    // Global Exception Filter
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
