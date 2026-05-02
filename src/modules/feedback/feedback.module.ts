import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { StudentModule } from 'modules/student/student.module';

import { FeedbackService } from './services/feedback.service';
import { FeedbackRepository } from './repositories/feedback.repository';
import { FeedbackController } from './controllers/feedback.controller';

@Module({
  imports: [PrismaModule, StudentModule],
  controllers: [FeedbackController],
  providers: [FeedbackService, FeedbackRepository],
  exports: [FeedbackService]
})
export class FeedbackModule {}
