import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ProcessLeaveRequestDto {
  @ApiProperty({
    example: true,
    description: 'Kết quả xử lý yêu cầu bảo lưu (true = duyệt, false = từ chối)'
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiPropertyOptional({
    example: 'Đã kiểm tra điều kiện và chấp nhận bảo lưu',
    description: 'Ghi chú của người xử lý'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
