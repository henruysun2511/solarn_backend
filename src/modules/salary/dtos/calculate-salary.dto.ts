import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class CalculateSalaryDto {
  @ApiProperty({ example: 2026, description: 'Năm cần tính lương' })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({ example: 4, description: 'Tháng cần tính lương (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;
}
