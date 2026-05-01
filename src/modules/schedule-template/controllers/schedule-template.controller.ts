import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { ScheduleTemplateService } from '../services/schedule-template.service';
import { CreateScheduleTemplateDto } from '../dtos';

@Controller('schedule-templates')
@ApiBearerAuth()
export class ScheduleTemplateController {
  constructor(private readonly scheduleTemplateService: ScheduleTemplateService) {}

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
}
