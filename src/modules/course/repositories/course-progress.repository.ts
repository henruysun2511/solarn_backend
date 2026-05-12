import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CourseProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async countSessionsByClassIds(classIds: string[]) {
    if (classIds.length === 0) return new Map<string, { total: number; ended: number }>();

    const totals = await this.prisma.scheduleSession.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds } },
      _count: { _all: true }
    });

    const ended = await this.prisma.scheduleSession.groupBy({
      by: ['classId'],
      where: { classId: { in: classIds }, status: 'ENDED' },
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
}
