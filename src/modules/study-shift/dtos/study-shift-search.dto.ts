import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchDto } from 'shared/base';

import { StudyShiftSortBy } from '../enums/study-shift-sort-by.enum';

export class StudyShiftSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(StudyShiftSortBy)
  sortBy: StudyShiftSortBy = StudyShiftSortBy.SHIFT_CODE;

  @IsOptional()
  @IsString()
  timeRange?: string;
}
