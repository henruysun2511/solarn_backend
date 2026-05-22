import { Injectable } from '@nestjs/common';
import { Attendance, AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

export interface UpsertAttendanceInput {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  total: number;
}

@Injectable()
export class AttendanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertMany(items: UpsertAttendanceInput[]): Promise<Attendance[]> {
    const queries = items.map((item) =>
      this.prisma.attendance.upsert({
        where: {
          studentId_sessionId: {
            studentId: item.studentId,
            sessionId: item.sessionId
          }
        },
        create: {
          studentId: item.studentId,
          sessionId: item.sessionId,
          status: item.status,
          note: item.note
        },
        update: {
          status: item.status,
          note: item.note
        }
      })
    );

    return this.prisma.$transaction(queries);
  }

  async findEndedAttendancesForProgress(studentIds: string[], classIds: string[]) {
    if (studentIds.length === 0 || classIds.length === 0) return [];

    return await this.prisma.attendance.findMany({
      where: {
        studentId: { in: studentIds },
        session: {
          classId: { in: classIds },
          status: 'ENDED'
        }
      },
      select: {
        studentId: true,
        status: true,
        session: {
          select: {
            classId: true
          }
        }
      }
    });
  }

  async findBySessionId(sessionId: string) {
    const records = await this.prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: {
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        student: {
          studentCode: 'asc'
        }
      }
    });

    const summary: AttendanceSummary = {
      present: 0,
      absent: 0,
      late: 0,
      total: records.length
    };

    for (const record of records) {
      if (record.status === AttendanceStatus.PRESENT) summary.present += 1;
      else if (record.status === AttendanceStatus.ABSENT) summary.absent += 1;
      else if (record.status === AttendanceStatus.LATE) summary.late += 1;
    }

    return { records, summary };
  }
}
