import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';

import { CreateScheduleTemplateDto, ScheduleTemplateSearchDto, UpdateScheduleTemplateDto } from '../dtos';
import { ScheduleTemplateSortBy } from '../enums/schedule-template-sort-by.enum';
import { ScheduleTemplateService } from '../services/schedule-template.service';

@Controller('schedule-templates')
@ApiBearerAuth()
export class ScheduleTemplateController {
  constructor(private readonly scheduleTemplateService: ScheduleTemplateService) {}

  @SwaggerDoc({
    summary: 'Get All Schedule Templates',
    description:
      'Retrieve schedule templates with pagination, sorting, search by templateName, and filter by shiftCode.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by templateName' })
  @ApiQuery({ name: 'shiftCode', required: false, type: String, description: 'Filter by shiftCode' })
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
    enum: Object.values(ScheduleTemplateSortBy),
    description: 'Sort field for schedule templates.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách lịch mẫu thành công')
  async findAll(@Query() query: ScheduleTemplateSearchDto) {
    return this.scheduleTemplateService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Create Schedule Template',
    bodyType: CreateScheduleTemplateDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo lịch mẫu thành công')
  async create(@Body() dto: CreateScheduleTemplateDto) {
    return this.scheduleTemplateService.create(dto);
  }

  @SwaggerDoc({
    summary: 'Update Schedule Template',
    bodyType: UpdateScheduleTemplateDto,
    status: 200
  })
  @Put(':templateId')
  @ResponseMessage('Cập nhật lịch mẫu thành công')
  async update(@Param('templateId') templateId: string, @Body() dto: UpdateScheduleTemplateDto) {
    return this.scheduleTemplateService.update(templateId, dto);
  }

  @SwaggerDoc({
    summary: 'Delete Schedule Template',
    status: 200
  })
  @Delete(':templateId')
  @ResponseMessage('Xóa thành công')
  async delete(@Param('templateId') templateId: string) {
    return this.scheduleTemplateService.delete(templateId);
  }
}
