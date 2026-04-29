import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { AttendanceService } from '../services/attendance.service';
import { UpsertAttendanceDto } from '../dtos';

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
}
