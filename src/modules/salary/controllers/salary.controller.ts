import { Body, Controller, ForbiddenException, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { AppConfig } from 'common/constants';
import { IAccountRequest } from 'common/interfaces';

import { SalaryService } from '../services/salary.service';
import { CalculateSalaryDto } from '../dtos';

@ApiTags('Salary')
@ApiBearerAuth()
@Controller('salaries')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Post('preview')
  @ResponseMessage('Tính lương thành công')
  @SwaggerDoc({
    summary: 'Admin preview tính lương theo tháng (không lưu DB)',
    bodyType: CalculateSalaryDto,
    status: 201
  })
  async preview(@Body() dto: CalculateSalaryDto) {
    return this.salaryService.previewMonthlySalary(dto);
  }

  @Post('save')
  @ResponseMessage('Lưu bảng lương thành công')
  @SwaggerDoc({
    summary: 'Admin lưu bảng lương theo tháng (server tự tính lại trước khi lưu)',
    bodyType: CalculateSalaryDto,
    status: 201
  })
  async save(@Body() dto: CalculateSalaryDto, @User() user: IAccountRequest) {
    if (user.roleName !== AppConfig.ROLE.ADMIN) {
      throw new ForbiddenException('Chỉ ADMIN mới được tính lương');
    }

    return this.salaryService.saveMonthlySalary(dto);
  }
}
