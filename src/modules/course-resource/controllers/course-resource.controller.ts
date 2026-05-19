import { BadRequestException, Body, Controller, Get, Post, Query, Delete, Param } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResourceType } from '@prisma/client';
import { Public, ResponseMessage } from 'common/decorators';
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

  @SwaggerDoc({
    summary: 'Get Course Resources by Course ID',
    description: 'Retrieve all learning resources of a specific course, optionally filtered by type.',
    status: 200
  })
  @ApiQuery({ name: 'courseId', required: true, type: String, description: 'ID của khóa học' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ResourceType,
    description: 'Loại tài nguyên (DOCUMENT, VIDEO, AUDIO)'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách tài nguyên khóa học thành công')
  async findAllByCourseId(@Query('courseId') courseId: string, @Query('type') type?: ResourceType) {
    if (!courseId) {
      throw new BadRequestException('courseId là bắt buộc');
    }
    return this.courseResourceService.findAllByCourseId(courseId, type);
  }

  @SwaggerDoc({ summary: 'Delete course resource by resourceId', status: 200 })
  @Public()
  @Delete(':resourceId')
  @ResponseMessage('Xóa tài nguyên khóa học thành công')
  async delete(@Param('resourceId') resourceId: string) {
    return this.courseResourceService.delete(resourceId);
  }
}
