import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AppConfig } from 'common/constants';

export class RegisterDto {
  @ApiProperty({ example: 'student01', minLength: 3, maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username chỉ chứa chữ cái, số, dấu gạch dưới và dấu gạch ngang'
  })
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
}
