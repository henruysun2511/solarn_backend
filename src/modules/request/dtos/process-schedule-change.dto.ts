import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ProcessScheduleChangeDto {
  @ApiProperty({
    example: true,
    description: 'Kết quả xử lý yêu cầu đổi lịch (true = thành công/duyệt, false = thất bại/từ chối)'
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiPropertyOptional({
    example: 'Đã kiểm tra lịch và chấp nhận thay đổi',
    description: 'Ghi chú của người xử lý'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
