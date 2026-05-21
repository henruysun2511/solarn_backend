import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { SalarySearchDto } from '../dtos';

@Injectable()
export class SalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: SalarySearchDto): Prisma.SalaryWhereInput {
    const { search, year, month, teacherId } = query;

    const where: Prisma.SalaryWhereInput = {};

    if (search) {
      where.OR = [
        { teacher: { teacherCode: { contains: search, mode: 'insensitive' } } },
        { teacher: { profile: { fullName: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (year && month) {
      where.salaryDate = {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1))
      };
    } else if (year) {
      where.salaryDate = {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1))
      };
    }

    if (teacherId) {
      where.teacherId = teacherId;
    }

    return where;
  }

  async countBySalaryDate(salaryDate: Date) {
    return this.prisma.salary.count({
      where: {
        salaryDate
      }
    });
  }

  async createManySalaries(
    data: {
      teacherId: string;
      salaryDate: Date;
      totalSessions: number;
      bonus: Prisma.Decimal;
      deduction: Prisma.Decimal;
      totalAmount: Prisma.Decimal;
    }[]
  ) {
    return this.prisma.salary.createMany({ data });
  }

  findSalaryById(salaryId: string) {
    return this.prisma.salary.findUnique({
      where: { salaryId },
      select: {
        salaryId: true,
        teacherId: true,
        salaryDate: true,
        totalAmount: true
      }
    });
  }

  async findMany(query: SalarySearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    return this.prisma.salary.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        teacher: {
          include: {
            profile: {
              select: {
                fullName: true
              }
            }
          }
        }
      }
    });
  }

  async count(query: SalarySearchDto): Promise<number> {
    return this.prisma.salary.count({
      where: this.buildWhere(query)
    });
  }
}
