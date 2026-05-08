import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, Public } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { SortOrder } from 'common/enums';

import { CourseService } from '../services/course.service';
import { CreateCourseDto, CourseSearchDto, UpdateCourseDto } from '../dtos';
import { CourseSortBy } from '../enums/course-sort-by.enum';

@Controller('courses')
@ApiTags('Courses')
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @SwaggerDoc({
    summary: 'Get All Courses',
    description: 'Retrieve courses with pagination, sorting, search by courseName, and filter by level.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by courseName' })
  @ApiQuery({ name: 'courseName', required: false, type: String, description: 'Query by course name' })
  @ApiQuery({ name: 'level', required: false, type: String, description: 'Filter by level' })
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
    enum: Object.values(CourseSortBy),
    description: 'Sort field for courses.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách khóa học thành công')
  async findAll(@Query() query: CourseSearchDto) {
    return await this.courseService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Create Course',
    bodyType: CreateCourseDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Thêm thành công')
  async create(@Body() dto: CreateCourseDto) {
    return await this.courseService.create(dto);
  }

  @SwaggerDoc({
    summary: 'Update Course',
    bodyType: UpdateCourseDto,
    status: 200
  })
  @Put(':courseId')
  @ResponseMessage('Sửa khóa học thành công')
  async update(@Param('courseId') courseId: string, @Body() dto: UpdateCourseDto) {
    return await this.courseService.update(courseId, dto);
  }

  @SwaggerDoc({
    summary: 'Delete Course',
    status: 200
  })
  @Delete(':courseId')
  @ResponseMessage('Xóa thành công')
  async delete(@Param('courseId') courseId: string) {
    return await this.courseService.delete(courseId);
  }
}
