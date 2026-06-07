import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';

@Processor('email-queue', {
  lockDuration: 60000,
  stalledInterval: 30000,
  maxStalledCount: 2,
})
export class BookingProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    console.log(
      `[BullMQ] Bắt đầu xử lý job #${job.id} (attempt ${job.attemptsMade + 1})`,
    );

    try {
      await this.mailerService.sendMail(job.data);
      console.log(
        `[BullMQ] ✅ Gửi mail thành công → job #${job.id} to: ${job.data.to}`,
      );
    } catch (error) {
      console.error(
        `[BullMQ] ❌ Lỗi khi gửi mail (job #${job.id}, attempt ${job.attemptsMade + 1}):`,
        error?.message ?? error,
      );
      throw error;
    }
  }
}
