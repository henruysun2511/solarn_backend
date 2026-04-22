import { BadRequestException, Injectable } from '@nestjs/common';
import type { Account, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AppConfig } from 'common/constants';
import { generateCode } from 'common/utils';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AccountCreateInput): Promise<Account> {
    return this.prisma.account.create({ data });
  }

  async createWithProfile(input: {
    username: string;
    passwordHash: string;
    roleId: string;
    salaryRate?: string;
    profile?: {
      fullName: string;
    };
  }): Promise<Account> {
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({
        where: { roleId: input.roleId },
        select: { roleName: true }
      });

      if (!role) {
        throw new BadRequestException('Role not found');
      }

      if (role.roleName !== AppConfig.ROLE.ADMIN && role.roleName !== AppConfig.ROLE.TEACHER) {
        throw new BadRequestException('Only ADMIN and TEACHER roles are allowed');
      }

      const mustHaveProfile = role.roleName === AppConfig.ROLE.TEACHER;

      if (mustHaveProfile && !input.profile?.fullName) {
        throw new BadRequestException('profile.fullName is required for TEACHER role');
      }

      const account = await tx.account.create({
        data: {
          username: input.username,
          password: input.passwordHash,
          role: { connect: { roleId: input.roleId } },
          ...(input.profile || mustHaveProfile ? { profile: { create: { fullName: input.profile?.fullName } } } : {})
        },
        include: { profile: true }
      });

      if (role.roleName === AppConfig.ROLE.TEACHER) {
        if (!account.profile?.profileId) {
          throw new BadRequestException('Profile is required for TEACHER role');
        }

        if (!input.salaryRate) {
          throw new BadRequestException('salaryRate is required for TEACHER role');
        }

        await tx.teacher.create({
          data: {
            profile: { connect: { profileId: account.profile.profileId } },
            teacherCode: generateCode('TCH'),
            salaryRate: input.salaryRate
          }
        });
      }

      return account;
    });
  }
}
