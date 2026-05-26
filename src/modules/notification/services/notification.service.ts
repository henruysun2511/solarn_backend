import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';

import { CreateNotificationDto } from '../dtos';
import { NotificationRepository } from '../repositories/notification.repositories';

export type CreateNotificationPayload = {
  title: string;
  content: string;
  type?: NotificationType;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationService {
  constructor(private readonly notificationRepo: NotificationRepository) {}

  async create(accountId: string, dto: CreateNotificationPayload) {
    return this.notificationRepo.create({ accountId, ...dto });
  }

  async findByAccountId(accountId: string) {
    return this.notificationRepo.findByAccountId(accountId);
  }
}
