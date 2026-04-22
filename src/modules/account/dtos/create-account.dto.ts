import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested
} from 'class-validator';
import { AppConfig } from 'common/constants';

export class CreateAccountProfileDto {
  @ApiProperty({ example: 'Nguyen Van A', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName: string;
}

export class CreateAccountDto {
  @ApiProperty({ example: 'teacher01', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  username: string;

  @ApiProperty({ example: '123456', minLength: AppConfig.PASSWORD.MIN_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MinLength(AppConfig.PASSWORD.MIN_LENGTH)
  password: string;

  @ApiProperty({ example: '123456', minLength: AppConfig.PASSWORD.MIN_LENGTH })
  @IsString()
  @IsNotEmpty()
  @MinLength(AppConfig.PASSWORD.MIN_LENGTH)
  passwordConfirm: string;

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
