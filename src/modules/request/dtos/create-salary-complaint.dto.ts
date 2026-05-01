import { IsDecimal, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSalaryComplaintDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID của bảng lương đang khiếu nại'
  })
  @IsUUID()
  @IsNotEmpty()
  salaryId: string;

  @ApiProperty({
    example: 5000000,
    description: 'Số tiền đề xuất (đơn vị: đồng)'
  })
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '1,2' })
  @IsNotEmpty()
  proposedAmount: number;

  @ApiProperty({
    example: 'Lương tháng trước tính sai, cần điều chỉnh lên',
    description: 'Lý do khiếu nại'
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
