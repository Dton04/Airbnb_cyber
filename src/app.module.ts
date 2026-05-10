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
import { BookingModule } from './modules/booking/booking.module';
import { CommentModule } from './modules/comment/comment.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EMAIL_USER, EMAIL_PASS } from './common/constants/app.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      },
      defaults: {
        from: '"Airbnb Clone" <noreply@airbnb-clone.com>',
      },
    }),
    PrismaModule,
    CloudinaryModule,
    RedisCacheModule,
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
