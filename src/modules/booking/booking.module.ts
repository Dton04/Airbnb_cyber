import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingProcessor } from './booking.processor';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
    }),
    MailerModule,
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingProcessor]
})
export class BookingModule { }
