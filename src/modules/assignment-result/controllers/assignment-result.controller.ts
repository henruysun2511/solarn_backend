import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage, User } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { IAccountRequest } from 'common/interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AssignmentResultService } from '../services/assignment-result.service';
import { UpsertAssignmentResultDto } from '../dtos';

@ApiBearerAuth()
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
}
