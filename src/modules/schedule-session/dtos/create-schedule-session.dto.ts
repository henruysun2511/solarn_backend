import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateScheduleSessionDto {
  @ApiProperty({ example: 'S1', description: 'Mã ca học (shiftCode)' })
  @IsString()
  @IsNotEmpty()
  shiftCode: string;

  @ApiProperty({ example: '2026-05-25', description: 'Ngày học (YYYY-MM-DD hoặc ISO date)' })
  @IsDateString()
  studyDate: string;
}
