import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ProcessTransferRequestDto {
  @ApiProperty({
    example: true,
    description: 'Kết quả xử lý yêu cầu chuyển lớp (true = duyệt, false = từ chối)'
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiPropertyOptional({
    example: 'Đã xác minh thông tin và đồng ý chuyển lớp',
    description: 'Ghi chú của người xử lý'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
