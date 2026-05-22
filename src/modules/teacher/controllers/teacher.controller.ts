import { Body, Controller, Get, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, User, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { TeacherSearchDto } from '../dtos/teacher-search.dto';
import { UpdateTeacherProfileDto } from '../dtos/update-teacher-profile.dto';
import { TeacherSortBy } from '../enums/teacher-sort-by.enum';
import { TeacherService } from '../services/teacher.service';

@Controller('teacher')
@ApiBearerAuth()
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @SwaggerDoc({
    summary: 'Lấy thông tin profile của giáo viên đang đăng nhập',
    description: "Returns the authenticated teacher's profile with personal info.",
    status: 200
  })
  @Get('profile')
  @ResponseMessage('Lấy thông tin giáo viên thành công')
  async getMyProfile(@User() user: IAccountRequest) {
    return this.teacherService.findMyProfile(user.accountId);
  }

  @SwaggerDoc({
    summary: 'Cập nhật thông tin profile giáo viên',
    description: "Update the authenticated teacher's profile fields.",
    status: 200,
    bodyType: UpdateTeacherProfileDto
  })
  @Patch('profile')
  @ResponseMessage('Cập nhật thông tin giáo viên thành công')
  async updateMyProfile(@User() user: IAccountRequest, @Body() dto: UpdateTeacherProfileDto) {
    return this.teacherService.updateMyProfile(user.accountId, dto);
  }

  @SwaggerDoc({
    summary: 'Lấy toàn bộ danh sách giáo viên',
    description:
      'Retrieve all teachers with pagination, sorting, and search by name or teacher code. Includes teacher specialties.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by teacher full name or teacher code'
  })
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
    enum: Object.values(TeacherSortBy),
    description: 'Sort field for teachers.'
  })
  @Get()
  @Public()
  @ResponseMessage('Lấy danh sách giáo viên thành công')
  findAll(@Query() query: TeacherSearchDto) {
    return this.teacherService.findAll(query);
  }
}
