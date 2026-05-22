import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { StudentClassSearchDto } from '../dtos/student-class-search.dto';
import { StudentSearchDto } from '../dtos/student-search.dto';
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

  private buildWhereByClass(classId: string, query: StudentClassSearchDto): Prisma.StudentWhereInput {
    const { search } = query;
    return {
      enrollments: { some: { classId } },
      ...(search && { profile: { fullName: { contains: search, mode: 'insensitive' } } })
    };
  }

  private buildWhere(query: StudentSearchDto): Prisma.StudentWhereInput {
    const { search } = query;
    return {
      ...(search && { profile: { fullName: { contains: search, mode: 'insensitive' } } })
    };
  }

  async findManyByClassId(classId: string, query: StudentClassSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhereByClass(classId, query);

    const orderBy: Prisma.StudentOrderByWithRelationInput | undefined =
      sortBy === StudentSortBy.NAME ? { profile: { fullName: sortOrder } } : undefined;

    return this.prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { profile: true }
    });
  }

  async countByClassIdQuery(classId: string, query: StudentClassSearchDto): Promise<number> {
    return this.prisma.student.count({
      where: this.buildWhereByClass(classId, query)
    });
  }

  async findMany(query: StudentSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

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

  async countAllQuery(query: StudentSearchDto): Promise<number> {
    return this.prisma.student.count({
      where: this.buildWhere(query)
    });
  }
}
