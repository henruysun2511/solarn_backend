import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { CreateFeedbackDto, FeedbackSearchDto } from '../dtos';
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

  @SwaggerDoc({
    summary: 'Lấy danh sách feedback của tôi (giáo viên)',
    description: 'Retrieve feedbacks for the authenticated teacher with pagination and sorting.',
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
  @Get('teacher/my-feedbacks')
  @ResponseMessage('Lấy danh sách feedback thành công')
  async findMyTeacherFeedbacks(@User() user: IAccountRequest, @Query() query: FeedbackClassSearchDto) {
    return this.feedbackService.findMyTeacherFeedbacks(user, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách feedback của tôi (học sinh)',
    description: 'Retrieve feedbacks for the authenticated student with pagination and sorting.',
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
  @Get('my')
  @ResponseMessage('Lấy danh sách feedback thành công')
  async findMyStudentFeedbacks(@User() user: IAccountRequest, @Query() query: FeedbackClassSearchDto) {
    return this.feedbackService.findMyStudentFeedbacks(user, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách feedback (admin)',
    description: 'Returns paginated feedbacks with optional filters (search, starRating, isFeatured).',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by feedback content' })
  @ApiQuery({ name: 'starRating', required: false, type: Number, description: 'Filter by star rating (1-5)' })
  @ApiQuery({ name: 'isFeatured', required: false, type: String, description: 'Filter by isFeatured (true/false)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @Get()
  @ResponseMessage('Lấy danh sách feedback thành công')
  async findAll(@Query() query: FeedbackSearchDto) {
    return this.feedbackService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách feedback nổi bật (public)',
    description: 'Returns feedbacks where isFeatured is true, for public display.',
    status: 200
  })
  @Public()
  @Get('featured')
  @ResponseMessage('Lấy danh sách feedback nổi bật thành công')
  async findFeatured() {
    return this.feedbackService.findFeatured();
  }

  @SwaggerDoc({
    summary: 'Cập nhật trạng thái isFeatured của feedback',
    description: 'Toggle the isFeatured flag for a feedback.',
    status: 200
  })
  @Patch(':feedbackId/featured')
  @ResponseMessage('Cập nhật trạng thái hiển thị thành công')
  async updateIsFeatured(@Param('feedbackId') feedbackId: string, @Body('isFeatured') isFeatured: boolean) {
    return this.feedbackService.updateIsFeatured(feedbackId, isFeatured);
  }
}
