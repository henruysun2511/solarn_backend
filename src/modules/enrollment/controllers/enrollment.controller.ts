import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { EnrollmentStatus } from '@prisma/client';
import { SwaggerDoc } from 'common/swagger';

import { EnrollmentSearchDto } from '../dtos';
import { EnrollmentService } from '../services/enrollment.service';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @SwaggerDoc({
    summary: 'Lấy danh sách enrollment',
    description: 'Retrieve paginated enrollments with optional filters.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by student name or code' })
  @ApiQuery({ name: 'classId', required: false, type: String, format: 'uuid', description: 'Filter by class ID' })
  @ApiQuery({ name: 'status', required: false, enum: EnrollmentStatus, description: 'Filter by enrollment status' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order (desc or asc).',
    example: SortOrder.DESC
  })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Sort field.', example: 'createdAt' })
  @Get()
  @ResponseMessage('Lấy danh sách enrollment thành công')
  async findAll(@Query() query: EnrollmentSearchDto) {
    return this.enrollmentService.findAll(query);
  }
}
