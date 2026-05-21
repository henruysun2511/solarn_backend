import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SearchDto } from 'shared/base';

import { SalarySortBy } from '../enums/salary-sort-by.enum';

export class SalarySearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(SalarySortBy)
  sortBy: SalarySortBy = SalarySortBy.SALARY_DATE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @ApiProperty({ example: 2026, description: 'Filter by year' })
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  @ApiProperty({ example: 4, description: 'Filter by month (1-12)' })
  month?: number;

  @IsOptional()
  @ApiProperty({ description: 'Filter by teacher ID' })
  teacherId?: string;
}
