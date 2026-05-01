import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchDto } from 'shared/base';

import { ScheduleTemplateSortBy } from '../enums/schedule-template-sort-by.enum';

export class ScheduleTemplateSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(ScheduleTemplateSortBy)
  sortBy: ScheduleTemplateSortBy = ScheduleTemplateSortBy.TEMPLATE_NAME;

  @IsOptional()
  @IsString()
  shiftCode?: string;
}
