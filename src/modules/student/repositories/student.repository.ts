import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class StudentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByAccountId(accountId: string) {
    return this.prisma.student.findFirst({
      where: {
        profile: {
          accountId
        }
      },
      select: {
        studentId: true,
        profile: { select: { accountId: true, fullName: true } }
      }
    });
  }
}
