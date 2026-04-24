import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountStatus, type Account, type GenderType, type Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { AppConfig } from 'common/constants';
import { generateCode } from 'common/utils';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<Account | null> {
    return this.prisma.account.findUnique({ where: { username } });
  }

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

  async registerStudentWithProfile(input: {
    username: string;
    passwordHash: string;
    studentRoleId: string;
    profile: {
      fullName: string;
      email: string;
      phone: string;
      gender: GenderType;
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: {
          username: input.username,
          password: input.passwordHash,
          status: AccountStatus.INACTIVE,
          role: { connect: { roleId: input.studentRoleId } },
          profile: {
            create: {
              fullName: input.profile.fullName,
              email: input.profile.email,
              phone: input.profile.phone,
              gender: input.profile.gender,
              student: {
                create: {
                  studentCode: generateCode('STU')
                }
              }
            }
          }
        },
        include: { profile: { include: { student: true } } }
      });

      return account;
    });
  }
}
