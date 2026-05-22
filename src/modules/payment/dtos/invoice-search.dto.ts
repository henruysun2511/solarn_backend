import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';
import { SearchDto } from 'shared/base';

export class InvoiceSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';
}
