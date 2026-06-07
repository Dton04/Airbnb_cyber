import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BookingController } from './controllers/booking.controller';
import { BookingService } from './services/booking.service';
import { BookingProcessor } from './processors/booking.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email-queue',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }),
  ],
  controllers: [BookingController],
  providers: [BookingService, BookingProcessor],
  exports: [BookingService],
})
export class BookingModule {}
