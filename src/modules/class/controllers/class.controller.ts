import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { AddStudentToClassDto, ClassSearchByCourseDto, CreateClassDto } from '../dtos';
import { ClassService } from '../services/class.service';

@Controller('classes')
@ApiBearerAuth()
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

  @SwaggerDoc({
    summary: 'Get Class List by Course ID',
    description:
      'Retrieve classes by courseId with total enrollments (registeredStudents), teacher details, and schedule templates.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo classId' })
  @Public()
  @Get('course/:courseId')
  @ResponseMessage('Lấy danh sách lớp học thành công')
  async findAllByCourseId(@Param('courseId') courseId: string, @Query() query: ClassSearchByCourseDto) {
    return this.classService.findAllByCourseId(courseId, query);
  }

  @SwaggerDoc({
    summary: 'Get Class Detail',
    description: 'Retrieve detailed information of a class by classId, including attendance statistics.',
    status: 200
  })
  @Public()
  @Get(':classId')
  @ResponseMessage('Lấy chi tiết lớp học thành công')
  async getClassDetail(@Param('classId') classId: string) {
    return this.classService.getClassDetail(classId);
  }
}
