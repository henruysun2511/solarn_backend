import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 'English Foundation A1', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  courseName: string;

  @ApiProperty({
    example: '2500000.00',
    description: 'Học phí (decimal dạng chuỗi, tối đa 2 chữ số thập phân)'
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'tuitionFee phải là số hợp lệ (ví dụ: 2500000 hoặc 2500000.00)'
  })
  tuitionFee: string;

  @ApiPropertyOptional({ example: 'A1', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  level?: string;

  @ApiProperty({ example: 24, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  totalSessions: number;
}
