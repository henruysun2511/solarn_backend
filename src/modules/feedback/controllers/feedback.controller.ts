import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IAccountRequest } from 'common/interfaces';
import { User } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { CreateFeedbackDto } from '../dtos';
import { FeedbackService } from '../services/feedback.service';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @SwaggerDoc({ summary: 'Create feedback', bodyType: CreateFeedbackDto, status: 201 })
  @Post()
  async create(@User() user: IAccountRequest, @Body() dto: CreateFeedbackDto) {
    const accountId = user.accountId;
    return this.feedbackService.create(accountId, dto);
  }
}
