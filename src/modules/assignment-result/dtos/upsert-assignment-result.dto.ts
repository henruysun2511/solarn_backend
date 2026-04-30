import { Type } from 'class-transformer';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { GradeStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpsertAssignmentResultDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440100' })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440200' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiPropertyOptional({ example: 9.5, description: 'Điểm số (Decimal 5,2)' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  score?: number;

  @ApiPropertyOptional({ enum: GradeStatus, example: GradeStatus.GRADED })
  @IsEnum(GradeStatus)
  @IsOptional()
  status?: GradeStatus;

  @ApiPropertyOptional({ example: 'Làm bài tốt, cần cải thiện phần...' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
