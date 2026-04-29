import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { BranchSortBy } from '../enums/branch-sort-by.enum';

export class BranchSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(BranchSortBy)
  sortBy: BranchSortBy = BranchSortBy.CREATED_AT;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;
}
