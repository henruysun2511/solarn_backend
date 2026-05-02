import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDoc } from 'common/swagger';

import { CreateCourseResourceDto } from '../dtos/create-course-resource.dto';
import { CourseResourceService } from '../services/course-resource.service';

@ApiTags('CourseResources')
@Controller('course-resources')
export class CourseResourceController {
  constructor(private readonly courseResourceService: CourseResourceService) {}

  @SwaggerDoc({ summary: 'Create course resource', bodyType: CreateCourseResourceDto, status: 201 })
  @Post()
  async create(@Body() dto: CreateCourseResourceDto) {
    return this.courseResourceService.create(dto);
  }
}
