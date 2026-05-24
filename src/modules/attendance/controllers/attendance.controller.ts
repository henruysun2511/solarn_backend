import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';
import { IAccountRequest } from 'common/interfaces';

import { AttendanceService } from '../services/attendance.service';
import { MyAttendanceSearchDto, UpsertAttendanceDto } from '../dtos';

@ApiBearerAuth()
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @SwaggerDoc({
    summary: 'Bulk upsert attendance (student per session)',
    bodyType: UpsertAttendanceDto,
    isArray: true,
    status: 201
  })
  @Post('bulk')
  @ResponseMessage('Điểm danh thành công')
  async upsertMany(@Body() items: UpsertAttendanceDto[]) {
    return this.attendanceService.upsertMany(items);
  }

  @SwaggerDoc({
    summary: 'Get attendance by session ID',
    description: 'Returns attendance records with student info and summary counts (present, absent, late).'
  })
  @Get('session/:sessionId')
  @ResponseMessage('Lấy danh sách điểm danh thành công')
  async findBySessionId(@Param('sessionId') sessionId: string) {
    return this.attendanceService.findBySessionId(sessionId);
  }

  @SwaggerDoc({
    summary: 'Lấy lịch sử điểm danh của tôi (học sinh)',
    description: 'Returns paginated attendance history for the authenticated student.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by course name' })
  @ApiQuery({ name: 'status', required: false, enum: ['PRESENT', 'ABSENT', 'LATE'] })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @Get('my')
  @ResponseMessage('Lấy lịch sử điểm danh thành công')
  async findMyAttendances(@User() user: IAccountRequest, @Query() query: MyAttendanceSearchDto) {
    return this.attendanceService.findMyAttendances(user, query);
  }
}
