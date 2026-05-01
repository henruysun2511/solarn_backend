import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IAccountRequest } from 'common/interfaces';
import { User } from 'common/decorators';

import { CreateSalaryComplaintDto } from '../dtos';
import { RequestService } from '../services/request.service';

@ApiTags('Requests')
@Controller('requests')
@ApiBearerAuth()
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post('salary-complaint')
  @ApiOperation({
    summary: 'Tạo request khiếu nại lương',
    description: 'Giáo viên tạo đơn khiếu nại bảng lương'
  })
  @ApiResponse({
    status: 201,
    description: 'Đơn khiếu nại đã được tạo thành công',
    schema: {
      example: {
        requestId: 'uuid',
        type: 'SALARY_COMPLAINT',
        status: 'PENDING',
        salaryId: 'uuid',
        proposedAmount: 5000000,
        reason: 'Lương tháng trước tính sai',
        createdAt: '2026-05-01T10:30:00Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bảng lương không tồn tại hoặc input không hợp lệ'
  })
  @ApiResponse({
    status: 409,
    description: 'Không thể khiếu nại bảng lương của giáo viên khác'
  })
  async createSalaryComplaint(@User() user: IAccountRequest, @Body() dto: CreateSalaryComplaintDto) {
    const accountId = user.accountId;
    return this.requestService.createSalaryComplaint(accountId, dto);
  }
}
