import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, ValidateIf } from 'class-validator';

export class ProcessReEnrollmentRequestDto {
  @ApiProperty({
    example: true,
    description: 'Kết quả xử lý yêu cầu tái nhập học (true = duyệt, false = từ chối)'
  })
  @IsBoolean()
  isSuccess: boolean;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'ID lớp học mới admin xếp cho học viên khi duyệt yêu cầu'
  })
  @ValidateIf((dto: ProcessReEnrollmentRequestDto) => dto.isSuccess === true)
  @IsUUID()
  toClassId?: string;

  @ApiPropertyOptional({
    example: 'Đã xếp học viên vào lớp phù hợp',
    description: 'Ghi chú của người xử lý'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
