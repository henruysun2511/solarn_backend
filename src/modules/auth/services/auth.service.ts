import { Injectable } from '@nestjs/common';
import { AccountService } from 'modules/account/services/account.service';
import { RegisterStudentDto } from 'modules/account/dtos';
import { MailerService } from 'shared/mailer/mailer.service';

import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly mailerService: MailerService,
    private readonly otpService: OtpService
  ) {}

  /**
   * Đăng kí tài khoản mới cho sinh viên
   * Quy trình:
   * 1. Kiểm tra password và passwordConfirm khớp
   * 2. Kiểm tra username đã tồn tại chưa
   * 3. Lấy role STUDENT từ RoleService
   * 4. Tạo Account, Profile, Student trong cùng transaction
   */
  async signUp(dto: RegisterStudentDto) {
    const { email } = dto;
    const result = await this.accountService.registerStudent(dto);
    if (email) {
      const otpData = await this.otpService.issueRegisterOtp(email);

      void this.mailerService.sendRegisterOtpMail({
        to: email,
        fullName: dto.fullName,
        otp: otpData.otp,
        expiresInMinutes: otpData.expiresInMinutes
      });
    }

    return result;
  }
}
