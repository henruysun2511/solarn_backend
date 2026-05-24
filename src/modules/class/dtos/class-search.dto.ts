import { IsOptional, IsString } from 'class-validator';
import { SearchDto } from 'shared/base';

export class ClassSearchByDto extends SearchDto {
  @IsOptional()
  @IsString()
  sortBy: string = 'startDate';
}
