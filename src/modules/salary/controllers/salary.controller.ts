import { BadRequestException, Body, Controller, ForbiddenException, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, User, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { SortOrder } from 'common/enums';
import { AppConfig } from 'common/constants';
import { IAccountRequest } from 'common/interfaces';

import { SalaryService } from '../services/salary.service';
import { CalculateSalaryDto, SalarySearchDto } from '../dtos';
import { SalarySortBy } from '../enums/salary-sort-by.enum';

@ApiTags('Salary')
@ApiBearerAuth()
@Controller('salaries')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @SwaggerDoc({
    summary: 'Get All Salaries',
    description:
      'Retrieve salaries with pagination, sorting, search by teacher code/name, and filter by year/month/teacherId.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by teacher code or full name' })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by month (1-12)' })
  @ApiQuery({ name: 'teacherId', required: false, type: String, description: 'Filter by teacher ID' })
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
    enum: Object.values(SalarySortBy),
    description: 'Sort field for salaries.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách lương thành công')
  async findAll(@Query() query: SalarySearchDto) {
    return this.salaryService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Get My Salaries',
    description: "Retrieve the authenticated teacher's own salaries with pagination, sorting, and month/year filter.",
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'year', required: false, type: Number, description: 'Filter by year' })
  @ApiQuery({ name: 'month', required: false, type: Number, description: 'Filter by month (1-12)' })
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
    enum: Object.values(SalarySortBy),
    description: 'Sort field for salaries.'
  })
  @Get('my-salaries')
  @ResponseMessage('Lấy danh sách lương của tôi thành công')
  async findMySalaries(@Query() query: SalarySearchDto, @User() user: IAccountRequest) {
    return this.salaryService.findMySalaries(user, query);
  }

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
