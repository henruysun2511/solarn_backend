import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferRequestDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  fromClassId: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  toClassId: string;

  @ApiProperty({ example: 'Muốn chuyển vì lịch làm việc', required: false })
  @IsString()
  reason?: string;
}
