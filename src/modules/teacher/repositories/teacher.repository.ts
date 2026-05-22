import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { TeacherSearchDto } from '../dtos/teacher-search.dto';
import { TeacherSortBy } from '../enums/teacher-sort-by.enum';

@Injectable()
export class TeacherRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findTeacherIdByAccountId(accountId: string): Promise<{ teacherId: string } | null> {
    return this.prisma.teacher.findFirst({
      where: {
        profile: {
          accountId
        }
      },
      select: {
        teacherId: true
      }
    });
  }

  async findTeachersForSalary() {
    return this.prisma.teacher.findMany({
      select: {
        teacherId: true,
        teacherCode: true,
        salaryRate: true,
        profile: { select: { fullName: true } }
      }
    });
  }

  async findTeacherByAccountId(accountId: string): Promise<{ teacherId: string; teacherCode: string } | null> {
    const teacher = await this.prisma.teacher.findFirst({
      where: {
        profile: {
          accountId
        }
      },
      select: {
        teacherId: true,
        teacherCode: true
      }
    });
    return teacher;
  }

  async findTeacherProfileByAccountId(accountId: string) {
    return this.prisma.teacher.findFirst({
      where: {
        profile: {
          accountId
        }
      },
      include: {
        profile: true,
        teacherSpecialties: {
          include: { course: true }
        }
      }
    });
  }

  async updateProfile(
    accountId: string,
    data: { fullName?: string; phone?: string; gender?: any; dob?: string; avatarUrl?: string }
  ) {
    return this.prisma.profile.update({
      where: { accountId },
      data
    });
  }

  private buildWhere(query: TeacherSearchDto): Prisma.TeacherWhereInput {
    const { search } = query;
    return {
      ...(search && {
        OR: [
          { profile: { fullName: { contains: search, mode: 'insensitive' } } },
          { teacherCode: { contains: search, mode: 'insensitive' } }
        ]
      })
    };
  }

  async findMany(query: TeacherSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    const orderBy: Prisma.TeacherOrderByWithRelationInput | undefined =
      sortBy === TeacherSortBy.NAME
        ? { profile: { fullName: sortOrder } }
        : sortBy === TeacherSortBy.CODE
          ? { teacherCode: sortOrder }
          : undefined;

    return this.prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        profile: true,
        teacherSpecialties: {
          include: {
            course: true
          }
        }
      }
    });
  }

  async countAllQuery(query: TeacherSearchDto): Promise<number> {
    return this.prisma.teacher.count({
      where: this.buildWhere(query)
    });
  }
}
