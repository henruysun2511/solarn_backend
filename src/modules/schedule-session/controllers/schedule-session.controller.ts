import { Body, Controller, Param, Patch } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { ScheduleSessionService } from '../services/schedule-session.service';
import { UpdateSessionStatusDto } from '../dtos';

@Controller('schedule-session')
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
}
