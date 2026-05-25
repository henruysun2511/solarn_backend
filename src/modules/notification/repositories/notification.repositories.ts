import { Injectable } from '@nestjs/common';
import { Notification, NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    accountId: string;
    title: string;
    content: string;
    type?: NotificationType;
    metadata?: Prisma.InputJsonValue;
  }): Promise<Notification> {
    return this.prisma.notification.create({
      data: {
        accountId: data.accountId,
        title: data.title,
        content: data.content,
        ...(data.type && { type: data.type }),
        ...(data.metadata !== undefined && { metadata: data.metadata })
      }
    });
  }
}
