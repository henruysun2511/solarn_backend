import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, User } from 'common/decorators';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { NotificationService } from '../services/notification.service';
import { CreateNotificationDto } from '../dtos';

@Controller('notifications')
@ApiTags('Notifications')
@ApiBearerAuth()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @SwaggerDoc({
    summary: 'Create Notification',
    bodyType: CreateNotificationDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo thông báo thành công')
  async create(@User() user: IAccountRequest, @Body() dto: CreateNotificationDto) {
    return this.notificationService.create(user.accountId, dto);
  }
}
