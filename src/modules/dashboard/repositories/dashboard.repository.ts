import { Injectable } from '@nestjs/common';
import { ClassSessionStatus, EnrollmentStatus, InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  countEndedSessionsByTeacherId(teacherId: string) {
    return this.prisma.scheduleSession.count({
      where: { class: { teacherId }, status: ClassSessionStatus.ENDED }
    });
  }

  calcTotalIncomeByTeacherId(teacherId: string) {
    return this.prisma.salary
      .aggregate({ where: { teacherId }, _sum: { totalAmount: true } })
      .then((r) => Number(r._sum.totalAmount || 0));
  }

  countClassesByTeacherId(teacherId: string) {
    return this.prisma.class.count({ where: { teacherId } });
  }

  findClassIdsByTeacherId(teacherId: string) {
    return this.prisma.class.findMany({
      where: { teacherId },
      select: { classId: true }
    });
  }

  countEnrollmentsByClassIds(classIds: string[]) {
    return this.prisma.enrollment.count({
      where: { classId: { in: classIds }, status: { not: EnrollmentStatus.DROPPED } }
    });
  }

  getTopStudentsByTeacherId(teacherId: string) {
    return this.prisma.assignmentResult.groupBy({
      by: ['studentId'],
      where: { session: { class: { teacherId } } },
      _avg: { score: true },
      orderBy: { _avg: { score: 'desc' } },
      take: 5
    });
  }

  findStudentsByIds(studentIds: string[]) {
    return this.prisma.student.findMany({
      where: { studentId: { in: studentIds } },
      select: {
        studentId: true,
        studentCode: true,
        profile: { select: { fullName: true, avatarUrl: true } }
      }
    });
  }

  findScoresByTeacherId(teacherId: string) {
    return this.prisma.assignmentResult.findMany({
      where: { session: { class: { teacherId } } },
      select: { score: true }
    });
  }

  findAttendancesByTeacherIdAndMonth(teacherId: string, startOfMonth: Date, endOfMonth: Date) {
    return this.prisma.attendance.findMany({
      where: {
        session: {
          class: { teacherId },
          studyDate: { gte: startOfMonth, lte: endOfMonth }
        }
      },
      select: { status: true }
    });
  }

  countPendingScheduleChangesByAccount(accountId: string) {
    return this.prisma.request.count({
      where: {
        senderAccountId: accountId,
        type: 'SCHEDULE_CHANGE',
        status: 'PENDING'
      } as any
    });
  }

  findSessionsByTeacherIdAndDateRange(teacherId: string, startOfDay: Date, endOfDay: Date) {
    return this.prisma.scheduleSession.findMany({
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
  }

  countEnrollmentsByStudentId(studentId: string) {
    return this.prisma.enrollment.count({
      where: { studentId, NOT: { status: EnrollmentStatus.DROPPED } }
    });
  }

  countAttendanceByStudentIdAndStatus(studentId: string, status: string) {
    return this.prisma.attendance.count({
      where: { studentId, status: status as any }
    });
  }

  calcAvgScoreByStudentId(studentId: string) {
    return this.prisma.assignmentResult
      .aggregate({ where: { studentId }, _avg: { score: true } })
      .then((r) => Number((r._avg.score || 0).toFixed(2)));
  }

  findActiveEnrollmentClassIds(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: { studentId, NOT: { status: EnrollmentStatus.DROPPED } },
      select: { classId: true }
    });
  }

  findUpcomingSessionsByClassIds(classIds: string[], from: Date) {
    return this.prisma.scheduleSession.findMany({
      where: { classId: { in: classIds }, studyDate: { gte: from } },
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
      orderBy: { studyDate: 'asc' },
      take: 5
    });
  }

  countInvoicesByStudentId(studentId: string) {
    return this.prisma.invoice.count({ where: { studentId } });
  }

  countInvoicesByStudentIdAndStatus(studentId: string, status: InvoiceStatus) {
    return this.prisma.invoice.count({ where: { studentId, status } });
  }

  countPendingLeaveRequestsByAccount(accountId: string) {
    return this.prisma.request.count({
      where: {
        senderAccountId: accountId,
        type: 'LEAVE_REQUEST',
        status: 'PENDING'
      } as any
    });
  }

  // ==================== ADMIN ====================

  countStudents() {
    return this.prisma.student.count();
  }

  countTeachers() {
    return this.prisma.teacher.count();
  }

  countCourses() {
    return this.prisma.course.count();
  }

  countClasses() {
    return this.prisma.class.count();
  }

  countEndedSessions() {
    return this.prisma.scheduleSession.count({ where: { status: ClassSessionStatus.ENDED } });
  }

  countEnrollmentsNotDropped() {
    return this.prisma.enrollment.count({ where: { NOT: { status: EnrollmentStatus.DROPPED } } });
  }

  countEnrollmentsByDateRange(gte: Date, lte: Date) {
    return this.prisma.enrollment.count({
      where: { createdAt: { gte, lte }, NOT: { status: EnrollmentStatus.DROPPED } }
    });
  }

  countStudentsByAccountDateRange(gte: Date, lte: Date) {
    return this.prisma.student.count({
      where: { profile: { account: { createdAt: { gte, lte } } } }
    });
  }

  countRequestsByTypeAndStatus(type: string, status: string) {
    return this.prisma.request.count({ where: { type: type as any, status: status as any } });
  }

  calcRevenueByDateRange(from: Date, to: Date) {
    return this.prisma.invoice
      .aggregate({ where: { status: InvoiceStatus.PAID, createdAt: { gte: from, lte: to } }, _sum: { amount: true } })
      .then((r) => Number(r._sum.amount || 0));
  }

  aggregateInvoiceAmount(where?: Prisma.InvoiceWhereInput) {
    return this.prisma.invoice
      .aggregate({ ...(where && { where }), _sum: { amount: true } })
      .then((r) => Number(r._sum.amount || 0));
  }

  getMonthlyRevenuePerMonth(start: Date, end: Date) {
    return Promise.all([
      this.prisma.invoice
        .aggregate({
          where: { status: InvoiceStatus.PAID, createdAt: { gte: start, lte: end } },
          _sum: { amount: true }
        })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.enrollment.count({ where: { createdAt: { gte: start, lte: end } } })
    ]);
  }

  countRequestsByDateRange(gte: Date, lte: Date) {
    return this.prisma.request.count({ where: { createdAt: { gte, lte } } });
  }

  countRequestsInRange(start: Date, end: Date) {
    return this.prisma.request.count({ where: { createdAt: { gte: start, lte: end } } });
  }

  groupRequestsByStatus() {
    return this.prisma.request.groupBy({ by: ['status'], _count: true });
  }

  groupRequestsByType() {
    return this.prisma.request.groupBy({ by: ['type'], _count: true });
  }

  findRecentRequests(limit: number) {
    return this.prisma.request.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        requestId: true,
        type: true,
        reason: true,
        status: true,
        createdAt: true,
        senderAccount: { select: { accountId: true, username: true } }
      }
    });
  }

  findCoursesWithClassesAndEnrollments() {
    return this.prisma.course.findMany({
      select: {
        courseId: true,
        courseName: true,
        classes: {
          select: {
            classId: true,
            enrollments: { where: { NOT: { status: EnrollmentStatus.DROPPED } }, select: { studentId: true } },
            Invoice: { select: { amount: true, status: true } }
          }
        }
      }
    });
  }

  findCoursesWithInvoices() {
    return this.prisma.course.findMany({
      select: {
        courseId: true,
        courseName: true,
        classes: {
          select: {
            Invoice: { where: { status: InvoiceStatus.PAID }, select: { amount: true } }
          }
        }
      }
    });
  }

  findRecentEnrollments(limit: number) {
    return this.prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        enrollmentId: true,
        createdAt: true,
        student: { select: { profile: { select: { fullName: true } } } },
        class: { select: { course: { select: { courseName: true } } } }
      }
    });
  }

  findRecentInvoices(limit: number) {
    return this.prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        transactionId: true,
        amount: true,
        status: true,
        createdAt: true,
        student: { select: { profile: { select: { fullName: true } } } },
        class: { select: { course: { select: { courseName: true } } } }
      }
    });
  }

  countAttendance() {
    return this.prisma.attendance.count();
  }

  countAttendanceByStatusIn(statuses: string[]) {
    return this.prisma.attendance.count({
      where: { status: { in: statuses as any } }
    });
  }

  aggregateAvgScore() {
    return this.prisma.assignmentResult
      .aggregate({ _avg: { score: true } })
      .then((r) => Number((r._avg.score || 0).toFixed(2)));
  }

  findAllScores() {
    return this.prisma.assignmentResult.findMany({ select: { score: true } });
  }
}
