import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { SalaryComplaintSortBy } from '../enums/request-sort-by.enum';

export class SalaryComplaintSearchDto extends SearchDto {
  @ApiPropertyOptional({ enum: SalaryComplaintSortBy, default: SalaryComplaintSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(SalaryComplaintSortBy)
  sortBy: SalaryComplaintSortBy = SalaryComplaintSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của tài khoản người gửi' })
  @IsOptional()
  @IsUUID()
  senderAccountId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của bảng lương khiếu nại' })
  @IsOptional()
  @IsUUID()
  salaryId?: string;
}
