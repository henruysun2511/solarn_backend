import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { StudyShiftService } from '../services/study-shift.service';
import { CreateStudyShiftDto } from '../dtos';

@Controller('study-shifts')
export class StudyShiftController {
  constructor(private readonly studyShiftService: StudyShiftService) {}

  @SwaggerDoc({
    summary: 'Create Study Shift',
    bodyType: CreateStudyShiftDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo thành công')
  async create(@Body() dto: CreateStudyShiftDto) {
    return this.studyShiftService.create(dto);
  }
}
