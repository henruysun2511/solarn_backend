import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { ScheduleSessionSortBy } from '../enums/schedule-session-sort-by.enum';

export class ScheduleSessionClassSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(ScheduleSessionSortBy)
  sortBy: ScheduleSessionSortBy = ScheduleSessionSortBy.STUDY_DATE;

  @IsOptional()
  @IsDateString()
  studyDate?: string;
}
