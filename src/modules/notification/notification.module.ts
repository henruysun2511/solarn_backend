import { Module } from '@nestjs/common';

import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { NotificationRepository } from './repositories/notification.repositories';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, NotificationRepository],
  exports: [NotificationService]
})
export class NotificationModule {}
