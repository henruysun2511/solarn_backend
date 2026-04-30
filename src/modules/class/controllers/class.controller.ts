import { Body, Controller, Param, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { ClassService } from '../services/class.service';
import { AddStudentToClassDto, CreateClassDto } from '../dtos';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @SwaggerDoc({
    summary: 'Create Class',
    bodyType: CreateClassDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo lớp thành công')
  async create(@Body() dto: CreateClassDto) {
    return this.classService.create(dto);
  }

  @SwaggerDoc({
    summary: 'Add student to class',
    bodyType: AddStudentToClassDto,
    status: 201
  })
  @Post(':classId/students')
  @ResponseMessage('Thêm học sinh vào lớp thành công')
  async addStudentToClass(@Param('classId') classId: string, @Body() dto: AddStudentToClassDto) {
    return this.classService.addStudentToClass(classId, dto.studentId);
  }
}
