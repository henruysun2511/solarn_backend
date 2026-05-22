import { Body, Controller, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, User } from 'common/decorators';
import { IAccountRequest, RequestWithUser } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';
import { Request, Response } from 'express';
import { RegisterStudentDto } from 'modules/account/dtos';

import { LoginDto, VerifyOtpDto } from '../dtos';
import { LocalAuthGuard } from '../guards';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly otpService: OtpService
  ) {}

  @SwaggerDoc({
    summary: 'Local Login',
    description: 'Login with username/email and password',
    bodyType: LoginDto,
    status: 200
  })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ResponseMessage('Đăng nhập thành công')
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Post('sign-up')
  @Public()
  @ResponseMessage('Đăng kí thành công. Vui lòng đợi quản trị viên kích hoạt tài khoản.')
  @SwaggerDoc({
    summary: 'Đăng kí tài khoản sinh viên',
    bodyType: RegisterStudentDto,
    status: 201
  })
  async signUp(@Body() dto: RegisterStudentDto) {
    return this.authService.signUp(dto);
  }

  @SwaggerDoc({
    summary: 'Xác thực email',
    bodyType: VerifyOtpDto,
    status: 201
  })
  @Post('verify-email')
  @Public()
  @ResponseMessage('Xác thực thành công')
  async verifyEmail(@Body() dto: VerifyOtpDto) {
    return this.otpService.verifyRegisterOtp(dto.email, dto.otp);
  }

  @SwaggerDoc({
    summary: 'Logout',
    description: 'Logout current device by revoking the refresh token in cookie',
    status: 200
  })
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(200)
  @ResponseMessage('Đăng xuất thành công')
  async logout(@User() account: IAccountRequest, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    await this.authService.logout(account.accountId, refreshToken, res);
  }

  @Public()
  @SwaggerDoc({
    summary: 'Refresh Token',
    status: 200
  })
  @Post('refresh-token')
  @ResponseMessage('Lấy lại accessToken thành công')
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    return await this.authService.refreshToken(refreshToken);
  }
}
