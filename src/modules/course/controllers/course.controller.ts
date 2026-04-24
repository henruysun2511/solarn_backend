import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { CourseService } from '../services/course.service';
import { CreateCourseDto } from '../dtos';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @SwaggerDoc({
    summary: 'Create Course',
    bodyType: CreateCourseDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Thêm thành công')
  async create(@Body() dto: CreateCourseDto) {
    return this.courseService.create(dto);
  }
}
