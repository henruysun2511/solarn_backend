import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({
    example: '2026-05-01T08:00:00.000Z',
    description: 'Ngày bắt đầu lớp (ISO 8601)'
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: 25, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxStudents: number;

  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440010',
    description: 'Bản ghi lịch mẫu gồm các ngày học trong tuần và mã ca'
  })
  @IsUUID()
  @IsNotEmpty()
  scheduleTemplateId: string;
}
