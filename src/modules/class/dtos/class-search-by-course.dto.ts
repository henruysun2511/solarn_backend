import { IsOptional, IsString } from 'class-validator';
import { SearchDto } from 'shared/base';

export class ClassSearchByCourseDto extends SearchDto {
  @IsOptional()
  @IsString()
  sortBy: string = 'startDate';
}
