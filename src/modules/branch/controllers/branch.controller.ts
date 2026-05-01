import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';
import { ApiBearerAuth } from '@nestjs/swagger';

import { BranchSearchDto, CreateBranchDto } from '../dtos';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchSortBy } from '../enums/branch-sort-by.enum';
import { BranchService } from '../services/branch.service';

@Controller('branches')
@ApiBearerAuth()
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @SwaggerDoc({
    summary: 'Get All Branches',
    description: 'Retrieve branches with pagination, sorting, search by branchCode/branchName, and filter by isActive.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by branchCode or branchName' })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status'
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
    enum: Object.values(BranchSortBy),
    description: 'Sort field for branches.'
  })
  @Get()
  @ResponseMessage('Lấy danh sách chi nhánh thành công')
  async findAll(@Query() query: BranchSearchDto) {
    return this.branchService.findAll(query);
  }

  @SwaggerDoc({
    summary: 'Create Branch',
    bodyType: CreateBranchDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Thêm thành công')
  async create(@Body() dto: CreateBranchDto) {
    return this.branchService.create(dto);
  }

  @SwaggerDoc({
    summary: 'Update Branch',
    bodyType: UpdateBranchDto,
    status: 200
  })
  @Put(':branchId')
  @ResponseMessage('Sửa chi nhánh thành công')
  async update(@Param('branchId') branchId: string, @Body() dto: UpdateBranchDto) {
    return this.branchService.update(branchId, dto);
  }

  @SwaggerDoc({
    summary: 'Delete Branch',
    status: 200
  })
  @Delete(':branchId')
  @ResponseMessage('Xóa thành công')
  async softDelete(@Param('branchId') branchId: string) {
    return this.branchService.softDelete(branchId);
  }
}
