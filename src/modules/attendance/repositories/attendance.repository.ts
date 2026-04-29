import { Injectable } from '@nestjs/common';
import { Attendance, AttendanceStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

export interface UpsertAttendanceInput {
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  note?: string;
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
}
