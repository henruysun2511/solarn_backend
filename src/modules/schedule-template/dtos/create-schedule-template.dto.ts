import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateScheduleTemplateDto {
  @ApiProperty({
    example: 'Lịch T2-T4-T6',
    maxLength: 255,
    description: 'Tên lịch mẫu'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  templateName: string;

  @ApiProperty({
    example: '2,4,6',
    maxLength: 20,
    description: 'Các thứ trong tuần (2-8), cách nhau bằng dấu phẩy hoặc dấu gạch. Ví dụ: 2,4,6 hoặc 2-5 hoặc 2, 3, 5'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  weekdays: string;

  @ApiProperty({
    example: 'S1',
    maxLength: 50,
    description: 'Mã ca học'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  shiftCode: string;
}
