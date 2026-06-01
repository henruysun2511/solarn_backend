import { ApiPropertyOptional } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { ReEnrollmentRequestSortBy } from '../enums/request-sort-by.enum';

export class ReEnrollmentRequestSearchDto extends SearchDto {
  @ApiPropertyOptional({ enum: ReEnrollmentRequestSortBy, default: ReEnrollmentRequestSortBy.CREATED_AT })
  @IsOptional()
  @IsEnum(ReEnrollmentRequestSortBy)
  sortBy: ReEnrollmentRequestSortBy = ReEnrollmentRequestSortBy.CREATED_AT;

  @ApiPropertyOptional({ enum: RequestStatus })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của tài khoản người gửi' })
  @IsOptional()
  @IsUUID()
  senderAccountId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của enrollment bảo lưu cũ' })
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của lớp cũ trước khi bảo lưu' })
  @IsOptional()
  @IsUUID()
  fromClassId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'ID của lớp mới được xếp học lại' })
  @IsOptional()
  @IsUUID()
  toClassId?: string;
}
