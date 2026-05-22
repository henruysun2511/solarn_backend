import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';
import { IAccountRequest } from 'common/interfaces';

import { AssignmentResultService } from '../services/assignment-result.service';
import { MyAssignmentResultSearchDto, UpsertAssignmentResultDto } from '../dtos';

@ApiBearerAuth()
@ApiTags('Assignment Results')
@Controller('assignment-results')
export class AssignmentResultController {
  constructor(private readonly assignmentResultService: AssignmentResultService) {}

  @SwaggerDoc({
    summary: 'Bulk upsert assignment results (grade input)',
    bodyType: UpsertAssignmentResultDto,
    isArray: true,
    status: 201
  })
  @Post('bulk')
  @ResponseMessage('Nhập điểm thành công')
  async upsertMany(@Body() items: UpsertAssignmentResultDto[], @User() user: IAccountRequest) {
    return this.assignmentResultService.upsertMany(items, user.accountId);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách kết quả bài tập theo giáo viên',
    description: 'Retrieve assignment results for the authenticated teacher with pagination and filters.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by student code or name' })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'sessionId', required: false, type: String, description: 'Filter by session ID' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @Get('my-teacher')
  @ResponseMessage('Lấy danh sách kết quả bài tập thành công')
  async findMyTeacherResults(@User() user: IAccountRequest, @Query() query: MyAssignmentResultSearchDto) {
    return this.assignmentResultService.findMyTeacherResults(user, query);
  }

  @SwaggerDoc({
    summary: 'Lấy danh sách kết quả bài tập theo học sinh',
    description: 'Retrieve assignment results for the authenticated student with pagination and filters.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by course name' })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'sessionId', required: false, type: String, description: 'Filter by session ID' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @Get('my-student')
  @ResponseMessage('Lấy danh sách kết quả bài tập thành công')
  async findMyStudentResults(@User() user: IAccountRequest, @Query() query: MyAssignmentResultSearchDto) {
    return this.assignmentResultService.findMyStudentResults(user, query);
  }
}
