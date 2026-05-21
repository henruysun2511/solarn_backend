import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { TeacherSortBy } from '../enums/teacher-sort-by.enum';

export class TeacherSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(TeacherSortBy)
  sortBy: TeacherSortBy = TeacherSortBy.NAME;
}
