import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveRequestDto {
  @ApiProperty({
    example: 'Đã kiểm tra và chấp nhận yêu cầu',
    required: false,
    description: 'Ghi chú của người phê duyệt'
  })
  @IsOptional()
  @IsString()
  approvalNote?: string;
}
