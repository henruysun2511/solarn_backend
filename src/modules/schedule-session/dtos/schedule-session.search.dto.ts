import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ClassSessionStatus } from '@prisma/client';
import { SearchDto } from 'shared/base';

import { ScheduleSessionSortBy } from '../enums/schedule-session-sort-by.enum';

export class ScheduleSessionSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(ScheduleSessionSortBy)
  sortBy: ScheduleSessionSortBy = ScheduleSessionSortBy.STUDY_DATE;

  @IsOptional()
  @IsEnum(ClassSessionStatus)
  status?: ClassSessionStatus;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsString()
  shiftCode?: string;
}
