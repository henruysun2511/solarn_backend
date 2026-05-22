import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { RequestClassSortBy } from '../enums/request-sort-by.enum';

export class RequestClassSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(RequestClassSortBy)
  sortBy: RequestClassSortBy = RequestClassSortBy.CREATED_AT;
}
