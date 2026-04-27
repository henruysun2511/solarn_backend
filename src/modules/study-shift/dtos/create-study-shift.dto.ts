import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateStudyShiftDto {
  @ApiProperty({ example: 'S1', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  shiftCode: string;

  @ApiProperty({ example: 'Ca sáng', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  shiftName: string;

  @ApiProperty({
    example: '07:00-09:00',
    maxLength: 50,
    description: 'Khoảng thời gian học của ca'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  timeRange: string;
}
