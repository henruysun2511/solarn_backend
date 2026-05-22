import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateClassDto {
  @ApiProperty({ format: 'uuid', required: false })
  @IsUUID()
  @IsOptional()
  teacherId?: string;

  @ApiProperty({
    example: '2026-05-01T08:00:00.000Z',
    description: 'Ngày bắt đầu lớp (ISO 8601)',
    required: false
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ example: 25, minimum: 1, required: false })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  maxStudents?: number;

  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Bản ghi lịch mẫu gồm các ngày học trong tuần và mã ca',
    required: false
  })
  @IsUUID()
  @IsOptional()
  scheduleTemplateId?: string;

  @ApiProperty({
    example: 'D6-404',
    description: 'Mã phòng',
    required: false
  })
  @IsString()
  @IsOptional()
  roomCode?: string;
}
