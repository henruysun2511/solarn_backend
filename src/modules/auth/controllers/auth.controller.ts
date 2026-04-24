import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDoc } from 'common/swagger';
import { ResponseMessage } from 'common/decorators';
import { RegisterStudentDto } from 'modules/account/dtos';

import { AuthService } from '../services/auth.service';
import { VerifyOtpDto } from '../dtos';
import { OtpService } from '../services/otp.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService
  ) {}

  @Post('sign-up')
  @ResponseMessage('Đăng kí thành công. Vui lòng đợi quản trị viên kích hoạt tài khoản.')
  @SwaggerDoc({
    summary: 'Đăng kí tài khoản sinh viên',
    bodyType: RegisterStudentDto,
    status: 201
  })
  async signUp(@Body() dto: RegisterStudentDto) {
    return this.authService.signUp(dto);
  }

  @Post('verify-email')
  @ResponseMessage('Xác thực thành công')
  @SwaggerDoc({
    summary: 'Xác thực email',
    bodyType: VerifyOtpDto,
    status: 201
  })
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyRegisterOtp(dto.email, dto.otp);
  }
}
