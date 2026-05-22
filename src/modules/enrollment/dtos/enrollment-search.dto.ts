import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';
import { EnrollmentStatus } from '@prisma/client';

export class EnrollmentSearchDto extends SearchDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';
}
