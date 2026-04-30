import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

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
}
