import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { AttendanceStatus } from '@prisma/client';
import { SearchDto } from 'shared/base';

export class MyAttendanceSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  sortBy: string = 'studyDate';
}
