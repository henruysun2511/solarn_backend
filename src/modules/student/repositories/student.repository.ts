import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { StudentClassSearchDto } from '../dtos/student-class-search.dto';
import { StudentSortBy } from '../enums/student-sort-by.enum';

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

  async findManyByClassId(classId: string, query: StudentClassSearchDto) {
    const { skip, limit, sortBy, sortOrder, search } = query;
    const where: import('@prisma/client').Prisma.StudentWhereInput = {
      enrollments: { some: { classId } },
      ...(search && { profile: { fullName: { contains: search, mode: 'insensitive' } } })
    };
    const orderBy: import('@prisma/client').Prisma.StudentOrderByWithRelationInput | undefined =
      sortBy === StudentSortBy.NAME ? { profile: { fullName: sortOrder } } : undefined;

    return this.prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { profile: true }
    });
  }

  async countByClassIdQuery(classId: string, query: StudentClassSearchDto) {
    const { search } = query;
    const where: import('@prisma/client').Prisma.StudentWhereInput = {
      enrollments: { some: { classId } },
      ...(search && { profile: { fullName: { contains: search, mode: 'insensitive' } } })
    };
    return this.prisma.student.count({ where });
  }
}
