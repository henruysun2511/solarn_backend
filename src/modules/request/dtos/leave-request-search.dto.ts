import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { LeaveRequestSortBy } from '../enums/request-sort-by.enum';

export class LeaveRequestSearchDto extends SearchDto {
  @ApiPropertyOptional({ enum: LeaveRequestSortBy, default: LeaveRequestSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(LeaveRequestSortBy)
  sortBy: LeaveRequestSortBy = LeaveRequestSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của tài khoản người gửi' })
  @IsOptional()
  @IsUUID()
  senderAccountId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của enrollment bảo lưu' })
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;
}
