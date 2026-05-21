import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { ClassSortBy } from '../enums/class-sort-by.enum';

export class ClassSearchByTeacherDto extends SearchDto {
  @IsOptional()
  @IsEnum(ClassSortBy)
  sortBy: ClassSortBy = ClassSortBy.START_DATE;
}
