import { Injectable } from '@nestjs/common';
import { OtpPurpose, type Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  createEmailOtp(data: Prisma.EmailOtpCreateInput) {
    return this.prisma.emailOtp.create({ data });
  }

  findLatestValidOtpByEmail(params: { email: string; purpose: OtpPurpose; now: Date }) {
    return this.prisma.emailOtp.findFirst({
      where: {
        email: params.email,
        purpose: params.purpose,
        usedAt: null,
        expiresAt: {
          gt: params.now
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  markOtpUsed(otpId: string, usedAt: Date) {
    return this.prisma.emailOtp.update({
      where: { otpId },
      data: { usedAt }
    });
  }

  markProfileEmailVerified(profileId: string, verifiedAt: Date) {
    return this.prisma.profile.update({
      where: { profileId },
      data: { emailVerifiedAt: verifiedAt }
    });
  }
}
