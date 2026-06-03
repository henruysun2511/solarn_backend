import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { BlogSortBy } from '../enums/blog-sort-by.enum';

export class BlogSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(BlogSortBy)
  sortBy: BlogSortBy = BlogSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isPublished?: boolean;
}
