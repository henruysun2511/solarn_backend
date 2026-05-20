import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { Public, ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import {
  CreateLeaveRequestDto,
  CreateSalaryComplaintDto,
  CreateScheduleChangeDto,
  CreateTransferRequestDto,
  LeaveRequestSearchDto,
  SalaryComplaintSearchDto,
  ScheduleChangeSearchDto,
  TransferRequestSearchDto
} from '../dtos';
import {
  LeaveRequestSortBy,
  SalaryComplaintSortBy,
  ScheduleChangeSortBy,
  TransferRequestSortBy,
  RequestClassSortBy
} from '../enums/request-sort-by.enum';
import { RequestClassSearchDto } from '../dtos/request-class-search.dto';
import { RequestService } from '../services/request.service';

@ApiTags('Requests')
@Controller('requests')
@ApiBearerAuth()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @SwaggerDoc({
    summary: 'Lấy danh sách khiếu nại lương',
    description: 'Retrieve salary complaints with pagination, sorting, search and filters',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'senderAccountId', required: false, type: String })
  @ApiQuery({ name: 'salaryId', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(SalaryComplaintSortBy) })
  @Public()
  @Get('salary-complaint')
  @ResponseMessage('Lấy danh sách khiếu nại lương thành công')
  async findAllSalaryComplaints(@Query() query: SalaryComplaintSearchDto, @User() user?: IAccountRequest) {
    return this.requestService.findAllSalaryComplaints(query, user);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu chuyển lớp',
    description: 'Retrieve class transfer requests with pagination, sorting, search and filters',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'senderAccountId', required: false, type: String })
  @ApiQuery({ name: 'fromClassId', required: false, type: String })
  @ApiQuery({ name: 'toClassId', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(TransferRequestSortBy) })
  @Public()
  @Get('transfer')
  @ResponseMessage('Lấy danh sách yêu cầu chuyển lớp thành công')
  async findAllTransferRequests(@Query() query: TransferRequestSearchDto, @User() user?: IAccountRequest) {
    return this.requestService.findAllTransferRequests(query, user);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu bảo lưu',
    description: 'Retrieve course deferral/leave requests with pagination, sorting, search and filters',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'senderAccountId', required: false, type: String })
  @ApiQuery({ name: 'enrollmentId', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(LeaveRequestSortBy) })
  @Public()
  @Get('leave-request')
  @ResponseMessage('Lấy danh sách yêu cầu bảo lưu thành công')
  async findAllLeaveRequests(@Query() query: LeaveRequestSearchDto, @User() user?: IAccountRequest) {
    return this.requestService.findAllLeaveRequests(query, user);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu đổi lịch/ca học',
    description: 'Retrieve schedule change requests with pagination, sorting, search and filters',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'senderAccountId', required: false, type: String })
  @ApiQuery({ name: 'sessionId', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ScheduleChangeSortBy) })
  @Public()
  @Get('schedule-change')
  @ResponseMessage('Lấy danh sách yêu cầu đổi ca thành công')
  async findAllScheduleChanges(@Query() query: ScheduleChangeSearchDto, @User() user?: IAccountRequest) {
    return this.requestService.findAllScheduleChanges(query, user);
  }

  @SwaggerDoc({
    summary: 'Tạo request khiếu nại lương',
    description: 'Giáo viên tạo đơn khiếu nại bảng lương',
    bodyType: CreateSalaryComplaintDto,
    status: 201
  })
  @Post('salary-complaint')
  async createSalaryComplaint(@User() user: IAccountRequest, @Body() dto: CreateSalaryComplaintDto) {
    const accountId = user.accountId;
    return this.requestService.createSalaryComplaint(accountId, dto);
  }

  @SwaggerDoc({
    summary: 'Tạo request chuyển lớp',
    description: 'Học viên yêu cầu chuyển từ lớp này sang lớp khác',
    bodyType: CreateTransferRequestDto,
    status: 201
  })
  @Post('transfer')
  async createTransferRequest(@User() user: IAccountRequest, @Body() dto: CreateTransferRequestDto) {
    const accountId = user.accountId;
    return this.requestService.createTransferRequest(accountId, dto);
  }

  @SwaggerDoc({
    summary: 'Tạo request bảo lưu',
    description: 'Học viên gửi yêu cầu bảo lưu khóa học của chính mình',
    bodyType: CreateLeaveRequestDto,
    status: 201
  })
  @Post('leave-request')
  async createLeaveRequest(@User() user: IAccountRequest, @Body() dto: CreateLeaveRequestDto) {
    const accountId = user.accountId;
    return this.requestService.createLeaveRequest(accountId, dto);
  }

  @SwaggerDoc({
    summary: 'Tạo request đổi ngày/ca buổi học',
    description: 'Giáo viên gửi đề xuất đổi lịch cho một buổi học cụ thể',
    bodyType: CreateScheduleChangeDto,
    status: 201
  })
  @Post('schedule-change')
  async createScheduleChangeRequest(@User() user: IAccountRequest, @Body() dto: CreateScheduleChangeDto) {
    const accountId = user.accountId;
    return this.requestService.createScheduleChangeRequest(accountId, dto);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách request theo lớp',
    description:
      'Retrieve all requests related to a class (transfer, leave, schedule change) with pagination and sorting.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by reason or sender name' })
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
    enum: Object.values(RequestClassSortBy),
    description: 'Sort field for requests.'
  })
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách request theo lớp thành công')
  async findAllByClassId(@Param('classId') classId: string, @Query() query: RequestClassSearchDto) {
    return this.requestService.findAllByClassId(classId, query);
  }
}
