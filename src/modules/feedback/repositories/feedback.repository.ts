import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { FeedbackClassSearchDto } from '../dtos/feedback-class-search.dto';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { studentId: string; classId: string; teacherId: string; content: string }) {
    return this.prisma.feedback.create({
      data: {
        student: { connect: { studentId: data.studentId } },
        class: { connect: { classId: data.classId } },
        teacher: { connect: { teacherId: data.teacherId } },
        content: data.content
      },
      select: {
        feedbackId: true,
        studentId: true,
        classId: true,
        teacherId: true,
        content: true,
        createdAt: true
      }
    });
  }

  private buildWhere(classId: string, query: FeedbackClassSearchDto): Prisma.FeedbackWhereInput {
    const { search } = query;
    return {
      classId,
      ...(search && { content: { contains: search, mode: 'insensitive' } })
    };
  }

  async findManyByClassId(classId: string, query: FeedbackClassSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.feedback.findMany({
      where: this.buildWhere(classId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { student: { include: { profile: true } } }
    });
  }

  async countByClassIdQuery(classId: string, query: FeedbackClassSearchDto): Promise<number> {
    return this.prisma.feedback.count({
      where: this.buildWhere(classId, query)
    });
  }
}
