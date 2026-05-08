import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SearchDto } from 'shared/base';

import { CourseSortBy } from '../enums/course-sort-by.enum';

export class CourseSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(CourseSortBy)
  sortBy: CourseSortBy = CourseSortBy.COURSE_NAME;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  courseName?: string;
}
