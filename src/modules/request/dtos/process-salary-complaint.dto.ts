import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ProcessSalaryComplaintDto {
  @ApiProperty({
    example: true,
    description: 'Kết quả xử lý khiếu nại lương (true = chấp nhận điều chỉnh, false = từ chối)'
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiPropertyOptional({
    example: 'Đã đối soát và chấp nhận điều chỉnh theo đề xuất',
    description: 'Ghi chú của người xử lý'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
