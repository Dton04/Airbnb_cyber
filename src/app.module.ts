import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { CloudinaryModule } from './common/cloudinary/cloudinary.module';
import { RedisCacheModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LocationModule } from './modules/location/location.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { APP_GUARD } from '@nestjs/core';
import { ResponseSuccessInterceptor } from './common/interceptors/response.success.interceptor';
import { RoomModule } from './modules/room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CloudinaryModule,
    RedisCacheModule,
    AuthModule,
    UserModule,
    LocationModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: LoggingInterceptor
    },
    {
      provide: APP_GUARD,
      useClass: ResponseSuccessInterceptor
    }
  ],
})
export class AppModule { }
