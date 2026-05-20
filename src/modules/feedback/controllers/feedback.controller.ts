import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { CreateFeedbackDto } from '../dtos';
import { FeedbackClassSearchDto } from '../dtos/feedback-class-search.dto';
import { FeedbackClassSortBy } from '../enums/feedback-sort-by.enum';
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

  @SwaggerDoc({
    summary: 'Lấy danh sách feedback theo lớp',
    description: 'Retrieve feedbacks for a specific class with pagination and sorting.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by feedback content' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order (desc or asc).',
    example: SortOrder.DESC
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: Object.values(FeedbackClassSortBy),
    description: 'Sort field for feedbacks.'
  })
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách feedback theo lớp thành công')
  async findAllByClassId(@Param('classId') classId: string, @Query() query: FeedbackClassSearchDto) {
    return this.feedbackService.findAllByClassId(classId, query);
  }
}
