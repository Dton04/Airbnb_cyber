import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule { }
