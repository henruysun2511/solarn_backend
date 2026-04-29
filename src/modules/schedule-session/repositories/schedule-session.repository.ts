import { Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ScheduleSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

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

  updateStatus(sessionId: string, status: ClassSessionStatus) {
    return this.prisma.scheduleSession.update({
      where: { sessionId },
      data: { status },
      select: { sessionId: true, status: true, studyDate: true, shiftCode: true, classId: true }
    });
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
}
