import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { MyAssignmentResultSearchDto } from '../dtos';

export interface UpsertAssignmentResultItem {
  sessionId: string;
  studentId: string;
  score: number;
  feedback?: string;
}

@Injectable()
export class AssignmentResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create-only bulk insert.
   * If (sessionId, studentId) already exists, it will be skipped (no update).
   */
  upsertMany(items: UpsertAssignmentResultItem[], gradedById: string) {
    const gradedAt = new Date();

    return this.prisma.assignmentResult.createMany({
      data: items.map((item) => ({
        sessionId: item.sessionId,
        studentId: item.studentId,
        score: item.score,
        feedback: item.feedback,
        gradedById,
        gradedAt
      })),
      skipDuplicates: true
    });
  }

  private buildTeacherWhere(teacherId: string, query: MyAssignmentResultSearchDto): Prisma.AssignmentResultWhereInput {
    const { search, classId, sessionId } = query;
    const where: Prisma.AssignmentResultWhereInput = {
      session: {
        class: {
          teacherId
        }
      }
    };

    if (classId) {
      where.session = {
        ...(where.session as Prisma.ScheduleSessionWhereInput),
        classId
      };
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (search) {
      where.student = {
        OR: [
          { studentCode: { contains: search, mode: 'insensitive' } },
          { profile: { fullName: { contains: search, mode: 'insensitive' } } }
        ]
      };
    }

    return where;
  }

  async findManyByTeacherId(teacherId: string, query: MyAssignmentResultSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.assignmentResult.findMany({
      where: this.buildTeacherWhere(teacherId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        student: {
          select: {
            studentId: true,
            studentCode: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        session: {
          select: {
            sessionId: true,
            studyDate: true,
            shiftCode: true,
            class: {
              select: {
                classId: true,
                roomCode: true,
                course: { select: { courseName: true } }
              }
            }
          }
        }
      }
    });
  }

  async countByTeacherId(teacherId: string, query: MyAssignmentResultSearchDto): Promise<number> {
    return this.prisma.assignmentResult.count({
      where: this.buildTeacherWhere(teacherId, query)
    });
  }

  private buildStudentWhere(studentId: string, query: MyAssignmentResultSearchDto): Prisma.AssignmentResultWhereInput {
    const { search, classId, sessionId } = query;
    const where: Prisma.AssignmentResultWhereInput = { studentId };

    if (classId) {
      where.session = { classId };
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (search) {
      where.session = {
        ...((where.session as Prisma.ScheduleSessionWhereInput) || {}),
        class: {
          course: { courseName: { contains: search, mode: 'insensitive' } }
        }
      };
    }

    return where;
  }

  async findManyByStudentId(studentId: string, query: MyAssignmentResultSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.assignmentResult.findMany({
      where: this.buildStudentWhere(studentId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        session: {
          select: {
            sessionId: true,
            studyDate: true,
            shiftCode: true,
            shift: {
              select: {
                shiftName: true,
                timeRange: true
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
        }
      }
    });
  }

  async countByStudentId(studentId: string, query: MyAssignmentResultSearchDto): Promise<number> {
    return this.prisma.assignmentResult.count({
      where: this.buildStudentWhere(studentId, query)
    });
  }
}
