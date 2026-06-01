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
  CreateReEnrollmentRequestDto,
  CreateSalaryComplaintDto,
  CreateScheduleChangeDto,
  CreateTransferRequestDto,
  LeaveRequestSearchDto,
  ProcessLeaveRequestDto,
  ProcessReEnrollmentRequestDto,
  ProcessSalaryComplaintDto,
  ProcessScheduleChangeDto,
  ProcessTransferRequestDto,
  ReEnrollmentRequestSearchDto,
  SalaryComplaintSearchDto,
  ScheduleChangeSearchDto,
  TransferRequestSearchDto
} from '../dtos';
import {
  LeaveRequestSortBy,
  ReEnrollmentRequestSortBy,
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
  @Get('salary-complaint')
  @ResponseMessage('Lấy danh sách khiếu nại lương thành công')
  async findAllSalaryComplaints(@Query() query: SalaryComplaintSearchDto, @User() user: IAccountRequest) {
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
    summary: 'Lấy danh sách yêu cầu tái nhập học',
    description: 'Retrieve re-enrollment requests with pagination, sorting, search and filters',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'senderAccountId', required: false, type: String })
  @ApiQuery({ name: 'enrollmentId', required: false, type: String })
  @ApiQuery({ name: 'fromClassId', required: false, type: String })
  @ApiQuery({ name: 'toClassId', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ReEnrollmentRequestSortBy) })
  @Public()
  @Get('re-enrollment')
  @ResponseMessage('Lấy danh sách yêu cầu tái nhập học thành công')
  async findAllReEnrollmentRequests(@Query() query: ReEnrollmentRequestSearchDto, @User() user?: IAccountRequest) {
    return this.requestService.findAllReEnrollmentRequests(query, user);
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
    summary: 'Lấy danh sách khiếu nại lương của tôi',
    description: 'Returns salary complaints for the current authenticated user.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(SalaryComplaintSortBy) })
  @Get('my-salary-complaints')
  @ResponseMessage('Lấy danh sách khiếu nại lương của tôi thành công')
  async findMySalaryComplaints(@Query() query: SalaryComplaintSearchDto, @User() user: IAccountRequest) {
    return this.requestService.findMySalaryComplaints(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu bảo lưu của tôi',
    description: 'Returns leave requests for the current authenticated user.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(LeaveRequestSortBy) })
  @Get('my-leave-requests')
  @ResponseMessage('Lấy danh sách yêu cầu bảo lưu của tôi thành công')
  async findMyLeaveRequests(@Query() query: LeaveRequestSearchDto, @User() user: IAccountRequest) {
    return this.requestService.findMyLeaveRequests(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu tái nhập học của tôi',
    description: 'Returns re-enrollment requests for the current authenticated user.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ReEnrollmentRequestSortBy) })
  @Get('my-re-enrollment-requests')
  @ResponseMessage('Lấy danh sách yêu cầu tái nhập học của tôi thành công')
  async findMyReEnrollmentRequests(@Query() query: ReEnrollmentRequestSearchDto, @User() user: IAccountRequest) {
    return this.requestService.findMyReEnrollmentRequests(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu đổi lịch của tôi',
    description: 'Returns schedule change requests for the current authenticated user.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ScheduleChangeSortBy) })
  @Get('my-schedule-changes')
  @ResponseMessage('Lấy danh sách yêu cầu đổi lịch của tôi thành công')
  async findMyScheduleChanges(@Query() query: ScheduleChangeSearchDto, @User() user: IAccountRequest) {
    return this.requestService.findMyScheduleChanges(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách yêu cầu chuyển lớp của tôi',
    description: 'Returns transfer requests for the current authenticated user.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: RequestStatus })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(TransferRequestSortBy) })
  @Get('my-transfer-requests')
  @ResponseMessage('Lấy danh sách yêu cầu chuyển lớp của tôi thành công')
  async findMyTransferRequests(@Query() query: TransferRequestSearchDto, @User() user: IAccountRequest) {
    return this.requestService.findMyTransferRequests(user.accountId, query);
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
    summary: 'Tạo request tái nhập học',
    description: 'Học viên gửi yêu cầu tái nhập học từ enrollment đang bảo lưu',
    bodyType: CreateReEnrollmentRequestDto,
    status: 201
  })
  @Post('re-enrollment')
  async createReEnrollmentRequest(@User() user: IAccountRequest, @Body() dto: CreateReEnrollmentRequestDto) {
    const accountId = user.accountId;
    return this.requestService.createReEnrollmentRequest(accountId, dto);
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

  @SwaggerDoc({
    summary: 'Xử lý yêu cầu đổi lịch/ca học',
    description:
      'ADMIN xử lý request đổi lịch. Nếu thành công sẽ cập nhật ScheduleSession theo đề xuất và approve request trong cùng 1 transaction.',
    bodyType: ProcessScheduleChangeDto,
    status: 200
  })
  @Patch('schedule-change/:requestId/process')
  @ResponseMessage('Xử lý yêu cầu đổi lịch thành công')
  async processScheduleChange(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ProcessScheduleChangeDto
  ) {
    return this.requestService.processScheduleChange(requestId, user, dto);
  }

  @SwaggerDoc({
    summary: 'Xử lý yêu cầu chuyển lớp',
    description:
      'ADMIN xử lý request chuyển lớp. Nếu duyệt sẽ drop enrollment lớp nguồn và tạo enrollment lớp đích trong cùng 1 transaction.',
    bodyType: ProcessTransferRequestDto,
    status: 200
  })
  @Patch('transfer/:requestId/process')
  @ResponseMessage('Xử lý yêu cầu chuyển lớp thành công')
  async processTransferRequest(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ProcessTransferRequestDto
  ) {
    return this.requestService.processTransferRequest(requestId, user, dto);
  }

  @SwaggerDoc({
    summary: 'Xử lý yêu cầu bảo lưu',
    description:
      'ADMIN xử lý request bảo lưu. Nếu duyệt sẽ cập nhật Enrollment.status = DEFERRED và update request trong cùng 1 transaction.',
    bodyType: ProcessLeaveRequestDto,
    status: 200
  })
  @Patch('leave-request/:requestId/process')
  @ResponseMessage('Xử lý yêu cầu bảo lưu thành công')
  async processLeaveRequest(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ProcessLeaveRequestDto
  ) {
    return this.requestService.processLeaveRequest(requestId, user, dto);
  }

  @SwaggerDoc({
    summary: 'Xử lý yêu cầu tái nhập học',
    description:
      'ADMIN xử lý request tái nhập học. Nếu duyệt sẽ tạo enrollment mới ở lớp được chọn và lưu lớp cũ/lớp mới trong request.',
    bodyType: ProcessReEnrollmentRequestDto,
    status: 200
  })
  @Patch('re-enrollment/:requestId/process')
  @ResponseMessage('Xử lý yêu cầu tái nhập học thành công')
  async processReEnrollmentRequest(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ProcessReEnrollmentRequestDto
  ) {
    return this.requestService.processReEnrollmentRequest(requestId, user, dto);
  }

  @SwaggerDoc({
    summary: 'Xử lý khiếu nại lương',
    description:
      'ADMIN xử lý khiếu nại lương. Nếu chấp nhận sẽ cập nhật Salary.totalAmount theo proposedAmount và update request trong cùng 1 transaction.',
    bodyType: ProcessSalaryComplaintDto,
    status: 200
  })
  @Patch('salary-complaint/:requestId/process')
  @ResponseMessage('Xử lý khiếu nại lương thành công')
  async processSalaryComplaint(
    @Param('requestId') requestId: string,
    @User() user: IAccountRequest,
    @Body() dto: ProcessSalaryComplaintDto
  ) {
    return this.requestService.processSalaryComplaint(requestId, user, dto);
  }
}
