import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateScheduleChangeDto {
  @ApiProperty({
    format: 'uuid',
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID của buổi học muốn đổi lịch'
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    example: 'SHIFT_A',
    description: 'Mã ca học đề xuất'
  })
  @IsString()
  @IsNotEmpty()
  proposedShiftCode: string;

  @ApiProperty({
    example: '2026-05-20',
    description: 'Ngày học đề xuất (ISO date)'
  })
  @IsDateString()
  @IsNotEmpty()
  proposedStudyDate: string;

  @ApiProperty({
    example: 'Bận lịch cá nhân nên xin dời buổi học',
    description: 'Lý do đổi lịch',
    required: false
  })
  @IsString()
  reason?: string;
}
