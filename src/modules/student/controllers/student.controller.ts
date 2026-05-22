import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, User, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { StudentClassSearchDto } from '../dtos/student-class-search.dto';
import { StudentSearchDto } from '../dtos/student-search.dto';
import { StudentSortBy } from '../enums/student-sort-by.enum';
import { StudentService } from '../services/student.service';
import { UpdateStudentProfileDto } from '../dtos/update-student-profile.dto';

@Controller('student')
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @SwaggerDoc({
    summary: 'Lấy toàn bộ danh sách học sinh',
    description: 'Retrieve all students with pagination, sorting, and search by name.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by student full name' })
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
    enum: Object.values(StudentSortBy),
    description: 'Sort field for students.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách học sinh thành công')
  findAll(@Query() query: StudentSearchDto) {
    return this.studentService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách học sinh theo classId',
    description: 'Retrieve students enrolled in a specific class with pagination, sorting, and search by name.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by student full name' })
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
    enum: Object.values(StudentSortBy),
    description: 'Sort field for students.'
  })
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách học sinh thành công')
  findAllByClassId(@Param('classId') classId: string, @Query() query: StudentClassSearchDto) {
    return this.studentService.findAllByClassId(classId, query);
  }

  @SwaggerDoc({
    summary: 'Lấy thông tin profile của học sinh đang đăng nhập',
    status: 200
  })
  @Get('profile')
  @ResponseMessage('Lấy thông tin học sinh thành công')
  async getMyProfile(@User() user: IAccountRequest) {
    return this.studentService.findMyProfile(user.accountId);
  }

  @SwaggerDoc({
    summary: 'Cập nhật thông tin profile học sinh',
    status: 200,
    bodyType: UpdateStudentProfileDto
  })
  @Patch('profile')
  @ResponseMessage('Cập nhật thông tin học sinh thành công')
  async updateMyProfile(@User() user: IAccountRequest, @Body() dto: UpdateStudentProfileDto) {
    return this.studentService.updateMyProfile(user.accountId, dto);
  }
}
