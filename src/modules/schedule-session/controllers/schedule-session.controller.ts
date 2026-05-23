import { Body, Controller, Param, Patch } from '@nestjs/common';
import { Public, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SortOrder } from 'common/enums';
import { Query, Get } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';

import { ScheduleSessionService } from '../services/schedule-session.service';
import { UpdateSessionStatusDto } from '../dtos';
import { ScheduleSessionClassSearchDto } from '../dtos/schedule-session-class-search.dto';
import { ScheduleSessionSortBy } from '../enums/schedule-session-sort-by.enum';
import { ScheduleSessionSearchDto } from '../dtos/schedule-session.search.dto';

@Controller('schedule-session')
@ApiBearerAuth()
export class ScheduleSessionController {
  constructor(private readonly scheduleSessionService: ScheduleSessionService) {}

  // Nghiệp vụ: giáo viên cập nhật trạng thái buổi học (chỉ đúng ngày/giờ học mới được cập nhật).
  @SwaggerDoc({
    summary: 'Update schedule session status (teacher action)',
    bodyType: UpdateSessionStatusDto,
    status: 200
  })
  @Patch(':sessionId/status')
  @ResponseMessage('Cập nhật trạng thái buổi học thành công')
  updateStatus(@Param('sessionId') sessionId: string, @Body() dto: UpdateSessionStatusDto) {
    return this.scheduleSessionService.updateStatus(sessionId, dto.status);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách buổi học theo classId',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'studyDate', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ScheduleSessionSortBy) })
  @Public()
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách buổi học thành công')
  findAllByClassId(@Param('classId') classId: string, @Query() query: ScheduleSessionClassSearchDto) {
    return this.scheduleSessionService.findAllByClassId(classId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách tất cả buổi học (Hỗ trợ lọc theo trạng thái, lớp, ca học)',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ClassSessionStatus })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'ID của lớp học' })
  @ApiQuery({ name: 'shiftCode', required: false, type: String, description: 'Mã ca học (VD: S1, T1)' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(ScheduleSessionSortBy) })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách buổi học thành công')
  findAll(@Query() query: ScheduleSessionSearchDto) {
    return this.scheduleSessionService.findAll(query);
  }
}
