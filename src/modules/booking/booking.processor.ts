import { Processor, WorkerHost } from '@nestjs/bullmq';
import { MailerService } from '@nestjs-modules/mailer';
import { Job } from 'bullmq';

@Processor('email-queue')
export class BookingProcessor extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    console.log(`Bắt đầu xử lý job gửi mail: ${job.id}`);
    
    try {
      await this.mailerService.sendMail(job.data);
      console.log(`Gửi mail thành công cho job: ${job.id}`);
    } catch (error) {
      console.error(`Lỗi khi gửi mail (job: ${job.id}):`, error.message);
      throw error; // Ném lỗi để BullMQ biết job này failed và có thể retry
    }
  }
}
