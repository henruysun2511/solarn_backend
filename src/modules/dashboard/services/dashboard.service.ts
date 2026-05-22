import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassSessionStatus, EnrollmentStatus, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TeacherService } from 'modules/teacher/services/teacher.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teacherService: TeacherService
  ) {}

  async getTeacherDashboard(accountId: string) {
    const teacher = await this.teacherService.findTeacherByAccountId(accountId);
    if (!teacher) throw new NotFoundException('Không tìm thấy giáo viên');

    const { teacherId } = teacher;

    const [
      totalSessions,
      totalIncome,
      totalClasses,
      totalStudents,
      topStudents,
      scoreDistribution,
      attendanceRate,
      pendingScheduleChanges,
      todaySessions
    ] = await Promise.all([
      this.countTotalSessions(teacherId),
      this.calcTotalIncome(teacherId),
      this.countClasses(teacherId),
      this.countStudents(teacherId),
      this.getTopStudents(teacherId),
      this.getScoreDistribution(teacherId),
      this.calcAttendanceRate(teacherId),
      this.countPendingScheduleChanges(accountId),
      this.getTodaySessions(teacherId)
    ]);

    return {
      totalSessions,
      totalIncome,
      totalClasses,
      totalStudents,
      topStudents,
      scoreDistribution,
      attendanceRate,
      pendingScheduleChanges,
      todaySessions
    };
  }

  private async countTotalSessions(teacherId: string) {
    return this.prisma.scheduleSession.count({
      where: { class: { teacherId }, status: ClassSessionStatus.ENDED }
    });
  }

  private async calcTotalIncome(teacherId: string) {
    const result = await this.prisma.salary.aggregate({
      where: { teacherId },
      _sum: { totalAmount: true }
    });
    return Number(result._sum.totalAmount || 0);
  }

  private async countClasses(teacherId: string) {
    return this.prisma.class.count({ where: { teacherId } });
  }

  private async countStudents(teacherId: string) {
    const classes = await this.prisma.class.findMany({
      where: { teacherId },
      select: { classId: true }
    });
    if (classes.length === 0) return 0;
    return this.prisma.enrollment.count({
      where: {
        classId: { in: classes.map((c) => c.classId) },
        status: { not: EnrollmentStatus.DROPPED }
      }
    });
  }

  private async getTopStudents(teacherId: string) {
    const results = await this.prisma.assignmentResult.groupBy({
      by: ['studentId'],
      where: { session: { class: { teacherId } } },
      _avg: { score: true },
      orderBy: { _avg: { score: 'desc' } },
      take: 5
    });

    if (results.length === 0) return [];

    const studentIds = results.map((r) => r.studentId);
    const students = await this.prisma.student.findMany({
      where: { studentId: { in: studentIds } },
      select: {
        studentId: true,
        studentCode: true,
        profile: { select: { fullName: true, avatarUrl: true } }
      }
    });

    const studentMap = new Map(students.map((s) => [s.studentId, s]));

    return results.map((r) => {
      const s = studentMap.get(r.studentId);
      return {
        studentId: r.studentId,
        fullName: s?.profile?.fullName || 'N/A',
        studentCode: s?.studentCode || '',
        avatarUrl: s?.profile?.avatarUrl || null,
        avgScore: Number((r._avg.score || 0).toFixed(2))
      };
    });
  }

  private async getScoreDistribution(teacherId: string) {
    const results = await this.prisma.assignmentResult.findMany({
      where: { session: { class: { teacherId } } },
      select: { score: true }
    });

    let excellent = 0;
    let good = 0;
    let average = 0;
    let weak = 0;
    let poor = 0;

    for (const r of results) {
      const score = Number(r.score);
      if (score >= 8.5) excellent++;
      else if (score >= 7) good++;
      else if (score >= 5) average++;
      else if (score >= 4) weak++;
      else poor++;
    }

    return { excellent, good, average, weak, poor };
  }

  private async calcAttendanceRate(teacherId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const attendances = await this.prisma.attendance.findMany({
      where: {
        session: {
          class: { teacherId },
          studyDate: { gte: startOfMonth, lte: endOfMonth }
        }
      },
      select: { status: true }
    });

    const total = attendances.length;
    if (total === 0) return 0;

    const present = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((present / total) * 100);
  }

  private async countPendingScheduleChanges(accountId: string) {
    return this.prisma.request.count({
      where: {
        senderAccountId: accountId,
        type: RequestType.SCHEDULE_CHANGE,
        status: RequestStatus.PENDING
      }
    });
  }

  private async getTodaySessions(teacherId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const sessions = await this.prisma.scheduleSession.findMany({
      where: {
        class: { teacherId },
        studyDate: { gte: startOfDay, lt: endOfDay }
      },
      include: {
        class: {
          select: {
            classId: true,
            roomCode: true,
            course: { select: { courseName: true } }
          }
        },
        shift: { select: { shiftName: true, timeRange: true } }
      },
      orderBy: { shiftCode: 'asc' }
    });

    return sessions.map((s) => ({
      sessionId: s.sessionId,
      studyDate: s.studyDate,
      shiftCode: s.shiftCode,
      shiftName: s.shift.shiftName,
      timeRange: s.shift.timeRange,
      status: s.status,
      class: {
        classId: s.class.classId,
        courseName: s.class.course.courseName,
        roomCode: s.class.roomCode
      }
    }));
  }
}
