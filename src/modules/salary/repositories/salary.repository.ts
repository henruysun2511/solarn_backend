import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class SalaryRepository {
  constructor(private readonly prisma: PrismaService) {}

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
}
