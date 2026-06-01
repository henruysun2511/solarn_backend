import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReEnrollmentRequestDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID của enrollment đang bảo lưu cần xin tái nhập học'
  })
  @IsUUID()
  @IsNotEmpty()
  enrollmentId: string;

  @ApiPropertyOptional({
    example: 'Em muốn quay lại học sau thời gian bảo lưu',
    description: 'Lý do xin tái nhập học'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
