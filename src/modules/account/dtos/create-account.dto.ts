import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';

import { RegisterDto } from './register.dto';

export class CreateAccountProfileDto {
  @ApiProperty({ example: 'Nguyen Van A', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;
}

export class CreateAccountDto extends RegisterDto {
  @ApiProperty({ description: 'Role UUID (chỉ ADMIN hoặc TEACHER)', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiPropertyOptional({
    description: 'Bắt buộc khi role là TEACHER (Decimal dạng string, ví dụ: "150000")',
    example: '150000'
  })
  @IsNumberString({ no_symbols: true })
  @IsOptional()
  salaryRate?: string;

  @ApiPropertyOptional({ type: CreateAccountProfileDto })
  @ValidateNested()
  @Type(() => CreateAccountProfileDto)
  @IsOptional()
  profile?: CreateAccountProfileDto;
}
