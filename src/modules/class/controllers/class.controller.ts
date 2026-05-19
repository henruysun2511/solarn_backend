import { Body, Controller, Param, Post, Get, Query } from '@nestjs/common';
import { Public, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { ClassService } from '../services/class.service';
import { AddStudentToClassDto, CreateClassDto, ClassSearchByCourseDto } from '../dtos';

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
  @Public()
  @Get('course/:courseId')
  @ResponseMessage('Lấy danh sách lớp học thành công')
  async findAllByCourseId(@Param('courseId') courseId: string, @Query() query: ClassSearchByCourseDto) {
    return this.classService.findAllByCourseId(courseId, query);
  }
}
