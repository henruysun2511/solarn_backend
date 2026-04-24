import { Injectable } from '@nestjs/common';
import { env } from 'config';
import nodemailer, { type Transporter } from 'nodemailer';
import { CustomLogger } from 'shared/logger/logger.service';

export interface SendMailInput {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

@Injectable()
export class MailerService {
  private transporter: Transporter | null = null;
  private transporterInitialized = false;
  private EMAIL_USER = env.EMAIL_USER;
  private EMAIL_PASS = env.EMAIL_PASS;

  constructor(private readonly logger: CustomLogger) {}

  private detectServiceFromUser(userEmail: string): string | null {
    const email = userEmail.trim().toLowerCase();
    const domain = email.split('@')[1];
    if (!domain) return null;

    if (domain === 'gmail.com' || domain === 'googlemail.com') return 'gmail';
    if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'hotmail';
    if (domain.startsWith('yahoo.')) return 'yahoo';

    return null;
  }

  private initTransporterIfNeeded() {
    if (this.transporterInitialized) return;
    this.transporterInitialized = true;

    const user = this.EMAIL_USER;
    const pass = this.EMAIL_PASS;

    if (!user || !pass) {
      this.logger.warn(
        'Mailer is not configured (EMAIL_USER/EMAIL_PASS missing). Skipping email sending.',
        'MailerService'
      );
      this.transporter = null;
      return;
    }

    const service = this.detectServiceFromUser(user);

    if (service) {
      this.transporter = nodemailer.createTransport({
        service,
        auth: {
          user,
          pass
        }
      });
      return;
    }

    this.logger.warn(
      'Mailer is not configured (cannot infer email provider from EMAIL_USER). Skipping email sending.',
      'MailerService'
    );
    this.transporter = null;
  }

  async sendMail(input: SendMailInput) {
    this.initTransporterIfNeeded();
    if (!this.transporter) return;

    const from = this.EMAIL_USER;

    await this.transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html
    });
  }

  async sendStudentRegistrationMail(params: { to: string; fullName: string; username: string }) {
    const appName = env.APP_NAME ?? 'Solarn';

    const subject = `[${appName}] Đăng kí tài khoản thành công`;
    const text = `Xin chào ${params.fullName},\n\nBạn đã đăng kí tài khoản (${params.username}) thành công. Vui lòng đợi quản trị viên kích hoạt tài khoản.\n\nTrân trọng,\n${appName}`;
    const html = `
      <p>Xin chào <b>${params.fullName}</b>,</p>
      <p>Bạn đã đăng kí tài khoản (<b>${params.username}</b>) thành công.</p>
      <p>Vui lòng đợi quản trị viên kích hoạt tài khoản.</p>
      <p>Trân trọng,<br/>${appName}</p>
    `;

    try {
      await this.sendMail({ to: params.to, subject, text, html });
    } catch (error) {
      this.logger.error('Send registration email failed', error, 'MailerService', {
        to: params.to,
        username: params.username
      });
    }
  }

  async sendRegisterOtpMail(params: { to: string; fullName: string; otp: string; expiresInMinutes: number }) {
    const appName = env.APP_NAME ?? 'Solarn';

    const subject = `[${appName}] Mã xác thực OTP`;
    const text = `Xin chào ${params.fullName},\n\nMã OTP của bạn là: ${params.otp}\nMã có hiệu lực trong ${params.expiresInMinutes} phút.\n\nTrân trọng,\n${appName}`;
    const html = `
      <p>Xin chào <b>${params.fullName}</b>,</p>
      <p>Mã OTP của bạn là: <b style="font-size: 20px; letter-spacing: 2px;">${params.otp}</b></p>
      <p>Mã có hiệu lực trong <b>${params.expiresInMinutes}</b> phút.</p>
      <p>Trân trọng,<br/>${appName}</p>
    `;

    try {
      await this.sendMail({ to: params.to, subject, text, html });
    } catch (error) {
      this.logger.error('Send OTP email failed', error, 'MailerService', {
        to: params.to
      });
    }
  }
}
