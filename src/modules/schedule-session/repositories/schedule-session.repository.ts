import { Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { ScheduleSessionClassSearchDto } from '../dtos/schedule-session-class-search.dto';
import { ScheduleSessionSearchDto } from '../dtos/schedule-session.search.dto';

@Injectable()
export class ScheduleSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDuplicateInClass(classId: string, shiftCode: string, studyDate: Date) {
    return this.prisma.scheduleSession.findFirst({
      where: { classId, shiftCode, studyDate },
      select: { sessionId: true }
    });
  }

  findTeacherConflict(teacherId: string, classId: string, shiftCode: string, studyDate: Date) {
    return this.prisma.scheduleSession.findFirst({
      where: {
        shiftCode,
        studyDate,
        class: { teacherId },
        NOT: { classId }
      },
      select: { sessionId: true, classId: true, shiftCode: true, studyDate: true }
    });
  }

  createOne(classId: string, shiftCode: string, studyDate: Date) {
    return this.prisma.scheduleSession.create({
      data: {
        classId,
        shiftCode,
        studyDate
      },
      select: {
        sessionId: true,
        classId: true,
        shiftCode: true,
        studyDate: true,
        status: true,
        shift: true
      }
    });
  }

  findTeacherSessionConflicts(teacherId: string, sessions: Array<{ shiftCode: string; studyDate: Date }>) {
    if (sessions.length === 0) return [];

    const uniquePairs = new Map<string, { shiftCode: string; studyDate: Date }>();
    for (const session of sessions) {
      uniquePairs.set(`${session.shiftCode}__${session.studyDate.toISOString()}`, session);
    }

    const orConditions = [...uniquePairs.values()].map((session) => ({
      shiftCode: session.shiftCode,
      studyDate: session.studyDate
    }));

    return this.prisma.scheduleSession.findMany({
      where: {
        class: {
          teacherId
        },
        OR: orConditions
      },
      select: {
        sessionId: true,
        classId: true,
        shiftCode: true,
        studyDate: true
      }
    });
  }

  findByIdForStatusUpdate(sessionId: string) {
    return this.prisma.scheduleSession.findUnique({
      where: { sessionId },
      select: {
        sessionId: true,
        studyDate: true,
        status: true,
        shift: {
          select: { timeRange: true }
        }
      }
    });
  }

  findByIdWithClassTeacher(sessionId: string) {
    return this.prisma.scheduleSession.findUnique({
      where: { sessionId },
      select: {
        sessionId: true,
        classId: true,
        shiftCode: true,
        studyDate: true,
        class: {
          select: {
            teacherId: true
          }
        }
      }
    });
  }

  findSessionConflict(shiftCode: string, studyDate: Date, excludeSessionId?: string) {
    return this.prisma.scheduleSession.findFirst({
      where: {
        shiftCode,
        studyDate,
        ...(excludeSessionId ? { NOT: { sessionId: excludeSessionId } } : {})
      },
      select: {
        sessionId: true,
        classId: true,
        shiftCode: true,
        studyDate: true
      }
    });
  }

  updateStatus(sessionId: string, status: ClassSessionStatus) {
    return this.prisma.scheduleSession.update({
      where: { sessionId },
      data: { status },
      select: { sessionId: true, status: true, studyDate: true, shiftCode: true, classId: true }
    });
  }

  countByClassId(classId: string) {
    return this.prisma.scheduleSession.count({
      where: {
        classId
      }
    });
  }

  countEndedByClassId(classId: string) {
    return this.prisma.scheduleSession.count({
      where: {
        classId,
        status: ClassSessionStatus.ENDED
      }
    });
  }

  async countStatsByClassIds(classIds: string[]) {
    if (classIds.length === 0) return new Map<string, { total: number; ended: number }>();

    const totals = await this.prisma.scheduleSession.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds } },
      _count: { _all: true }
    });

    const ended = await this.prisma.scheduleSession.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds }, status: ClassSessionStatus.ENDED },
      _count: { _all: true }
    });

    const map = new Map<string, { total: number; ended: number }>();
    for (const row of totals) {
      map.set(row.classId, { total: row._count._all, ended: 0 });
    }

    for (const row of ended) {
      const current = map.get(row.classId) ?? { total: 0, ended: 0 };
      map.set(row.classId, { ...current, ended: row._count._all });
    }

    return map;
  }

  async getSessionMetaMap(sessionIds: string[]): Promise<Map<string, { classId: string; status: ClassSessionStatus }>> {
    if (sessionIds.length === 0) return new Map();

    const sessions = await this.prisma.scheduleSession.findMany({
      where: { sessionId: { in: sessionIds } },
      select: { sessionId: true, classId: true, status: true }
    });

    return new Map(sessions.map((s) => [s.sessionId, { classId: s.classId, status: s.status }] as const));
  }

  async getSessionToClassIdMap(sessionIds: string[]): Promise<Map<string, string>> {
    if (sessionIds.length === 0) return new Map();

    const sessions = await this.prisma.scheduleSession.findMany({
      where: { sessionId: { in: sessionIds } },
      select: { sessionId: true, classId: true }
    });

    return new Map(sessions.map((s) => [s.sessionId, s.classId] as const));
  }

  findEndedSessionsWithinRange(salaryDate: Date, nextMonthDate: Date) {
    return this.prisma.scheduleSession.findMany({
      where: {
        status: ClassSessionStatus.ENDED,
        studyDate: {
          gte: salaryDate,
          lt: nextMonthDate
        }
      },
      select: {
        class: {
          select: {
            teacherId: true,
            course: {
              select: {
                tuitionFee: true,
                totalSessions: true
              }
            }
          }
        }
      }
    });
  }

  async findManyByClassId(classId: string, query: ScheduleSessionClassSearchDto) {
    const { skip, limit, sortBy, sortOrder, studyDate } = query;
    const where: import('@prisma/client').Prisma.ScheduleSessionWhereInput = {
      classId,
      ...(studyDate && { studyDate: { equals: new Date(studyDate) } })
    };
    return this.prisma.scheduleSession.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        shift: true,
        class: {
          select: {
            classId: true,
            room: {
              select: {
                roomId: true,
                roomCode: true
              }
            }
          }
        }
      }
    });
  }

  async countByClassIdQuery(classId: string, query: ScheduleSessionClassSearchDto) {
    const { studyDate } = query;
    const where: import('@prisma/client').Prisma.ScheduleSessionWhereInput = {
      classId,
      ...(studyDate && { studyDate: { equals: new Date(studyDate) } })
    };
    return this.prisma.scheduleSession.count({ where });
  }

  async findMany(query: ScheduleSessionSearchDto) {
    const { skip, limit, sortBy, sortOrder, status, classId, shiftCode } = query;

    const where: import('@prisma/client').Prisma.ScheduleSessionWhereInput = {
      ...(status && { status }),
      ...(classId && { classId }),
      ...(shiftCode && { shiftCode })
    };

    return this.prisma.scheduleSession.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        shift: true,
        class: {
          select: {
            classId: true,
            // classCode: true,
            room: {
              select: {
                roomId: true,
                roomCode: true
              }
            }
          }
        }
      }
    });
  }

  async countQuery(query: ScheduleSessionSearchDto) {
    const { status, classId, shiftCode } = query;

    const where: import('@prisma/client').Prisma.ScheduleSessionWhereInput = {
      ...(status && { status }),
      ...(classId && { classId }),
      ...(shiftCode && { shiftCode })
    };

    return this.prisma.scheduleSession.count({ where });
  }
}
