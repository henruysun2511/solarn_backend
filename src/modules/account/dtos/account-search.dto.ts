import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

import { AccountSortBy } from '../enums/account-sort-by.enum';

export class AccountSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(AccountSortBy)
  sortBy: AccountSortBy = AccountSortBy.CREATED_AT;

  @IsOptional()
  @IsUUID()
  roleId?: string;

  @IsOptional()
  @IsString()
  username?: string;
}
