import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { ScheduleChangeSortBy } from '../enums/request-sort-by.enum';

export class ScheduleChangeSearchDto extends SearchDto {
  @ApiPropertyOptional({ enum: ScheduleChangeSortBy, default: ScheduleChangeSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ScheduleChangeSortBy)
  sortBy: ScheduleChangeSortBy = ScheduleChangeSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của tài khoản người gửi' })
  @IsOptional()
  @IsUUID()
  senderAccountId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của buổi học đổi lịch' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}
