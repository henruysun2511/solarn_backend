import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { BranchService } from '../services/branch.service';
import { CreateBranchDto } from '../dtos';

@Controller('branchs')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

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
}
