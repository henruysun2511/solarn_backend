import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpsertAssignmentResultDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440100' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440200' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 9.5, description: 'Điểm số (Decimal 5,2) - bắt buộc, cho phép 0' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  score: number;

  @ApiPropertyOptional({ example: 'Làm bài tốt, cần cải thiện phần...' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
