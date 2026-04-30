import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage, User } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';

import { AssignmentResultService } from '../services/assignment-result.service';
import { UpsertAssignmentResultDto } from '../dtos';

@Controller('assignment-result')
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
  async upsertMany(@Body() items: UpsertAssignmentResultDto[], @User() user: any) {
    return this.assignmentResultService.upsertMany(items, user.accountId);
  }
}
