import { BadRequestException, Injectable } from '@nestjs/common';
import { OtpPurpose } from '@prisma/client';
import { env } from 'config';
import { compareOtp, generateOtpCode, hashOtp } from 'common/utils';
import { PrismaService } from 'prisma/prisma.service';

import { OtpRepository } from '../repositories/otp.repository';

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpRepo: OtpRepository
  ) {}

  private getOtpExpireMinutes(): number {
    const raw = env.OTP_EXPIRE_MINUTES;
    if (!raw) return 10;

    const minutes = Number(raw);
    if (!Number.isFinite(minutes) || minutes <= 0) return 10;

    return minutes;
  }

  async issueRegisterOtp(email: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { email }
    });

    if (!profile) {
      throw new BadRequestException('Email không tồn tại trong hệ thống');
    }

    const otp = generateOtpCode(6);
    const codeHash = await hashOtp(otp);

    const expiresInMinutes = this.getOtpExpireMinutes();
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await this.otpRepo.createEmailOtp({
      email,
      profile: { connect: { profileId: profile.profileId } },
      purpose: OtpPurpose.REGISTER,
      codeHash,
      expiresAt
    });

    return { otp, expiresAt, expiresInMinutes };
  }

  async verifyRegisterOtp(email: string, otp: string) {
    const now = new Date();
    const record = await this.otpRepo.findLatestValidOtpByEmail({
      email,
      purpose: OtpPurpose.REGISTER,
      now
    });

    if (!record) {
      throw new BadRequestException('OTP không hợp lệ hoặc đã hết hạn');
    }

    const matched = await compareOtp(otp, record.codeHash);
    if (!matched) {
      throw new BadRequestException('OTP không đúng');
    }

    const verifiedAt = new Date();

    await this.prisma.$transaction([
      this.otpRepo.markOtpUsed(record.otpId, verifiedAt),
      this.otpRepo.markProfileEmailVerified(record.profileId, verifiedAt)
    ]);

    return { email, verifiedAt };
  }
}
