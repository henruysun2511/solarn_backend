import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateLeaveRequestDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID của enrollment cần xin bảo lưu'
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiProperty({
    example: '2026-05-01',
    description: 'Ngày bắt đầu bảo lưu'
  })
  @IsDateString()
  @IsNotEmpty()
  leaveStartDate: string;

  @ApiProperty({
    example: '2026-06-01',
    description: 'Ngày kết thúc bảo lưu'
  })
  @IsDateString()
  @IsNotEmpty()
  leaveEndDate: string;

  @ApiProperty({
    example: 'Có việc cá nhân cần tạm dừng khóa học',
    description: 'Lý do xin bảo lưu',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
