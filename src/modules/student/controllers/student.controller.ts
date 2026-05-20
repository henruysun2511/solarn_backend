import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SortOrder } from 'common/enums';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { StudentService } from '../services/student.service';
import { StudentClassSearchDto } from '../dtos/student-class-search.dto';
import { StudentSortBy } from '../enums/student-sort-by.enum';

@Controller('student')
@ApiBearerAuth()
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @SwaggerDoc({
    summary: 'Lấy danh sách học sinh theo classId',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @ApiQuery({ name: 'sortBy', required: false, enum: Object.values(StudentSortBy) })
  @Get('class/:classId')
  @ResponseMessage('Lấy danh sách học sinh thành công')
  findAllByClassId(@Param('classId') classId: string, @Query() query: StudentClassSearchDto) {
    return this.studentService.findAllByClassId(classId, query);
  }
}
