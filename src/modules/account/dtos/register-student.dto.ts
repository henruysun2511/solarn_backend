import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GenderType } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { RegisterDto } from './register.dto';

export class RegisterStudentDto extends RegisterDto {
  @ApiProperty({ example: 'Nguyen Van A', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;

  @ApiPropertyOptional({ example: 'student01@gmail.com', maxLength: 255 })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(255)
  email: string;

  @ApiPropertyOptional({ example: '0987654321', maxLength: 20 })
  @IsString()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ enum: GenderType, example: GenderType.UNKNOWN })
  @IsEnum(GenderType)
  gender: GenderType;
}
