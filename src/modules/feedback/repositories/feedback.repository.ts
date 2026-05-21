import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { FeedbackClassSearchDto } from '../dtos/feedback-class-search.dto';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { studentId: string; classId: string; teacherId: string; content: string; starRating: number }) {
    return this.prisma.feedback.create({
      data: {
        student: { connect: { studentId: data.studentId } },
        class: { connect: { classId: data.classId } },
        teacher: { connect: { teacherId: data.teacherId } },
        content: data.content,
        starRating: data.starRating
      },
      select: {
        feedbackId: true,
        studentId: true,
        classId: true,
        teacherId: true,
        content: true,
        starRating: true,
        createdAt: true
      }
    });
  }

  private buildClassWhere(classId: string, query: FeedbackClassSearchDto): Prisma.FeedbackWhereInput {
    const { search } = query;
    return {
      classId,
      ...(search && { content: { contains: search, mode: 'insensitive' } })
    };
  }

  private buildTeacherWhere(teacherId: string, query: FeedbackClassSearchDto): Prisma.FeedbackWhereInput {
    const { search } = query;
    return {
      teacherId,
      ...(search && { content: { contains: search, mode: 'insensitive' } })
    };
  }

  async findManyByClassId(classId: string, query: FeedbackClassSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.feedback.findMany({
      where: this.buildClassWhere(classId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: {
          include: {
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        }
      }
    });
  }

  async countByClassIdQuery(classId: string, query: FeedbackClassSearchDto): Promise<number> {
    return this.prisma.feedback.count({
      where: this.buildClassWhere(classId, query)
    });
  }

  async findManyByTeacherId(teacherId: string, query: FeedbackClassSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.feedback.findMany({
      where: this.buildTeacherWhere(teacherId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: {
          include: {
            profile: { select: { fullName: true, avatarUrl: true } }
          }
        },
        class: {
          select: {
            classId: true,
            roomCode: true,
            course: { select: { courseName: true } }
          }
        }
      }
    });
  }

  async countByTeacherId(teacherId: string, query: FeedbackClassSearchDto): Promise<number> {
    return this.prisma.feedback.count({
      where: this.buildTeacherWhere(teacherId, query)
    });
  }
}
