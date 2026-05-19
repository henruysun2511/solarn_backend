import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { TransferRequestSortBy } from '../enums/request-sort-by.enum';

export class TransferRequestSearchDto extends SearchDto {
  @ApiPropertyOptional({ enum: TransferRequestSortBy, default: TransferRequestSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(TransferRequestSortBy)
  sortBy: TransferRequestSortBy = TransferRequestSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của tài khoản người gửi' })
  @IsOptional()
  @IsUUID()
  senderAccountId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của lớp học nguồn' })
  @IsOptional()
  @IsUUID()
  fromClassId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của lớp học đích' })
  @IsOptional()
  @IsUUID()
  toClassId?: string;
}
