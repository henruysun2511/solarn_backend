import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: 'student01@gmail.com' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '123456', description: 'Mã OTP 6 chữ số' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;
}
