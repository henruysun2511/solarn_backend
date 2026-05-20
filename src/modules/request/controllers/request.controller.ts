import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { Public, ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import {
  ApproveRequestDto,
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
  TransferRequestSortBy
} from '../enums/request-sort-by.enum';
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
    summary: 'Phê duyệt yêu cầu',
    description: 'ADMIN phê duyệt một request (chỉ khi đang PENDING)',
    bodyType: ApproveRequestDto,
    status: 200
  })
  @Patch(':requestId/approve')
  @ResponseMessage('Phê duyệt yêu cầu thành công')
  async approveRequest(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ApproveRequestDto
  ) {
    return this.requestService.approveRequest(requestId, user, dto);
  }
}
