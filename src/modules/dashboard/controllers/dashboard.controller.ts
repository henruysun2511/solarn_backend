import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, ResponseMessage } from 'common/decorators';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { DashboardService } from '../services/dashboard.service';

@ApiTags('Teacher Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @SwaggerDoc({
    summary: 'Lấy thông số thống kê cho teacher dashboard',
    description: 'Returns aggregated stats for the authenticated teacher.',
    status: 200
  })
  @Get('teacher')
  @ResponseMessage('Lấy thông tin dashboard thành công')
  async getTeacherDashboard(@User() user: IAccountRequest) {
    return this.dashboardService.getTeacherDashboard(user.accountId);
  }

  @SwaggerDoc({
    summary: 'Lấy thông số thống kê cho student dashboard',
    status: 200
  })
  @Get('student')
  @ResponseMessage('Lấy thông tin dashboard thành công')
  async getStudentDashboard(@User() user: IAccountRequest) {
    return this.dashboardService.getStudentDashboard(user.accountId);
  }
}
