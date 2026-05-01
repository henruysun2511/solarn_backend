import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';

import { CreateStudyShiftDto, StudyShiftSearchDto, UpdateStudyShiftDto } from '../dtos';
import { StudyShiftSortBy } from '../enums/study-shift-sort-by.enum';
import { StudyShiftService } from '../services/study-shift.service';

@Controller('study-shifts')
@ApiBearerAuth()
export class StudyShiftController {
  constructor(private readonly studyShiftService: StudyShiftService) {}

  @SwaggerDoc({
    summary: 'Get All Study Shifts',
    description:
      'Retrieve study shifts with pagination, sorting, search by shiftCode/shiftName, and filter by timeRange.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by shiftCode or shiftName' })
  @ApiQuery({ name: 'timeRange', required: false, type: String, description: 'Filter by timeRange' })
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
    enum: Object.values(StudyShiftSortBy),
    description: 'Sort field for study shifts.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách ca học thành công')
  async findAll(@Query() query: StudyShiftSearchDto) {
    return this.studyShiftService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Create Study Shift',
    bodyType: CreateStudyShiftDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo thành công')
  async create(@Body() dto: CreateStudyShiftDto) {
    return this.studyShiftService.create(dto);
  }

  @SwaggerDoc({
    summary: 'Update Study Shift',
    bodyType: UpdateStudyShiftDto,
    status: 200
  })
  @Put(':shiftId')
  @ResponseMessage('Sửa ca học thành công')
  async update(@Param('shiftId') shiftId: string, @Body() dto: UpdateStudyShiftDto) {
    return this.studyShiftService.update(shiftId, dto);
  }

  @SwaggerDoc({
    summary: 'Delete Study Shift',
    status: 200
  })
  @Delete(':shiftId')
  @ResponseMessage('Xóa thành công')
  async delete(@Param('shiftId') shiftId: string) {
    return this.studyShiftService.delete(shiftId);
  }
}
