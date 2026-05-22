import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from 'modules/account/services/account.service';
import { RegisterStudentDto } from 'modules/account/dtos';
import { MailerService } from 'shared/mailer/mailer.service';
import { comparePassword, hashToken } from 'common/utils';
import { IAccountRequest } from 'common/interfaces';
import { RoleService } from 'modules/role/services/role.service';
import { v4 as uuidv4 } from 'uuid';
import ms from 'ms';
import { env } from 'config';
import { Response } from 'express';
import { AppConfig } from 'common/constants';

import { AuthRepository } from '../repositories/auth.repository';

import { OtpService } from './otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly mailerService: MailerService,
    private readonly otpService: OtpService,
    private readonly roleService: RoleService,
    private readonly authRepo: AuthRepository,
    private readonly jwtService: JwtService
  ) {}

  async login(account: IAccountRequest, response: Response) {
    const { accountId } = account;

    const payload = await this.buildAuthPayload(accountId, account.roleName);
    const refreshToken = await this.generateRefreshTokenResponse(payload);

    const expireStr = env.JWT_REFRESH_TOKEN_EXPIRE;
    const isProd = env.PROJECT_STAGE === AppConfig.STAGES.PRODUCTION;

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: ms(expireStr as ms.StringValue), // milliseconds
      secure: isProd, // chỉ bật trên HTTPS
      sameSite: 'none' // cross-site set 'none'
    });

    return {
      roleName: account.roleName,
      username: account.username,
      accessToken: this.jwtService.sign(payload),
      refreshToken
    };
  }

  async validateUser(username: string, password: string) {
    const account = await this.accountService.findAccountForAuthByUsername(username);

    if (account && account.password) {
      const passwordTrue = await comparePassword(password, account.password);

      if (!passwordTrue) throw new BadRequestException('Mật khẩu không đúng');
      const roleName = await this.roleService.getNameByRoleId(account.roleId);
      return {
        accountId: account.accountId,
        username,
        roleName,
        roleId: account.roleId
      } as IAccountRequest;
    }
    return null;
  }

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

  private async generateRefreshTokenResponse(payload) {
    const expiresIn = env.JWT_REFRESH_TOKEN_EXPIRE;
    const expiresInMs = ms(expiresIn as ms.StringValue);

    const refresh_token = this.jwtService.sign(payload, {
      secret: env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: expiresInMs / 1000
    });
    await this.authRepo.create({
      accountId: payload.sub,
      token: hashToken(refresh_token),
      expiresAt: new Date(Date.now() + expiresInMs)
    });

    return refresh_token;
  }

  private async buildAuthPayload(
    accountId: string,
    roleName: string
  ): Promise<{
    sub: string;
    roleName: string;
    jti: string;
  }> {
    return {
      sub: accountId,
      roleName,
      jti: uuidv4()
    };
  }

  async logout(accountId: string, refreshToken: string, response: Response) {
    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await this.authRepo.deleteTokenByAccountIdAndToken(accountId, hashed);
    }

    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.PROJECT_STAGE === AppConfig.STAGES.PRODUCTION,
      sameSite: 'none'
    });
  }

  async refreshToken(token: string) {
    try {
      if (!token) throw new UnauthorizedException('Vui lòng đăng nhập');
      //Verify chữ ký & lấy payload
      const payload = this.jwtService.verify(token, { secret: env.JWT_REFRESH_TOKEN_SECRET });

      token = hashToken(token);

      // Kiểm tra token có tồn tại trong db không
      const tokenInDb = await this.authRepo.findTokenByAccountIdAndToken(payload.sub, token);

      if (!tokenInDb) throw new UnauthorizedException('Token đã bị thu hồi');

      // Kiểm tra account có tồn tại không
      const account = await this.accountService.findById(payload.sub);
      if (!account) throw new NotFoundException('Tài khoản không tồn tại');

      // Tạo accessToken mới
      const roleName = await this.roleService.getNameByRoleId(account.roleId);
      const payloadAccessToken = await this.buildAuthPayload(account.accountId, roleName!);

      const accessToken = this.jwtService.sign(payloadAccessToken);

      return {
        accessToken
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token đã hết hạn');
      }
      throw err;
    }
  }
}
