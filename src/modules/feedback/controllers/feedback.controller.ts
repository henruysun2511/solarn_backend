import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { ResponseMessage, User } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { Get, Param, Query } from '@nestjs/common';

import { CreateFeedbackDto } from '../dtos';
import { FeedbackClassSearchDto } from '../dtos/feedback-class-search.dto';
import { FeedbackService } from '../services/feedback.service';
import { FeedbackClassSortBy } from '../enums/feedback-sort-by.enum';

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
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(FeedbackClassSortBy) })
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách feedback theo lớp thành công')
  async findAllByClassId(@Param('classId') classId: string, @Query() query: FeedbackClassSearchDto) {
    return this.feedbackService.findAllByClassId(classId, query);
  }
}
