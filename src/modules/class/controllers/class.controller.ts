import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, User, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import {
  AddStudentToClassDto,
  ClassSearchByCourseDto,
  ClassSearchByDto,
  ClassSearchByStudentDto,
  ClassSearchByTeacherDto,
  CreateClassDto
} from '../dtos';
import { ClassSortBy } from '../enums/class-sort-by.enum';
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
    enum: Object.values(ClassSortBy),
    description: 'Sort field for classes.'
  })
  @Public()
  @Get('course/:courseId')
  @ResponseMessage('Lấy danh sách lớp học thành công')
  async findAllByCourseId(@Param('courseId') courseId: string, @Query() query: ClassSearchByCourseDto) {
    return this.classService.findAllByCourseId(courseId, query);
  }

  @SwaggerDoc({
    summary: 'Get My Classes (Teacher)',
    description: 'Retrieve classes assigned to the authenticated teacher, with pagination.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo classId' })
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
    enum: Object.values(ClassSortBy),
    description: 'Sort field for classes.'
  })
  @Get('my-classes')
  @ResponseMessage('Lấy danh sách lớp của tôi thành công')
  async findMyClasses(@User() user: IAccountRequest, @Query() query: ClassSearchByTeacherDto) {
    return this.classService.findMyClasses(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Get My Enrolled Classes (Student)',
    description: 'Retrieve classes that the authenticated student is enrolled in, with pagination.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo classId' })
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
    enum: Object.values(ClassSortBy),
    description: 'Sort field for classes.'
  })
  @Get('my-enrolled-classes')
  @ResponseMessage('Lấy danh sách lớp đã đăng ký thành công')
  async findMyEnrolledClasses(@User() user: IAccountRequest, @Query() query: ClassSearchByStudentDto) {
    return this.classService.findMyEnrolledClasses(user.accountId, query);
  }

  @SwaggerDoc({
    summary: 'Get Class Detail',
    description: 'Retrieve detailed information of a class by classId, including attendance statistics.',
    status: 200
  })
  @SwaggerDoc({
    summary: 'Get All Classes',
    description: 'Retrieve all classes with pagination.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Tìm kiếm theo classId' })
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
    enum: Object.values(ClassSortBy),
    description: 'Sort field for classes.'
  })
  @Public()
  @Get('')
  @ResponseMessage('Lấy danh sách lớp học thành công')
  async findAll(@Query() query: ClassSearchByDto) {
    return this.classService.findAll(query);
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
