import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassSessionStatus, EnrollmentStatus, InvoiceStatus, RequestStatus, RequestType } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { StudentService } from 'modules/student/services/student.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService
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

  async getStudentDashboard(accountId: string) {
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) throw new NotFoundException('Không tìm thấy học sinh');

    const { studentId } = student;

    const [
      totalClasses,
      totalAttended,
      totalAbsent,
      averageScore,
      upcomingSessions,
      totalInvoices,
      paidInvoices,
      pendingLeaveRequests
    ] = await Promise.all([
      this.countStudentClasses(studentId),
      this.countStudentAttendance(studentId, 'PRESENT'),
      this.countStudentAttendance(studentId, 'ABSENT'),
      this.calcStudentAverageScore(studentId),
      this.getUpcomingSessions(studentId),
      this.countStudentInvoices(studentId),
      this.countStudentInvoicesByStatus(studentId, InvoiceStatus.PAID),
      this.countPendingLeaveRequests(accountId)
    ]);

    const attendanceRate =
      totalAttended + totalAbsent > 0 ? Math.round((totalAttended / (totalAttended + totalAbsent)) * 100) : 0;

    return {
      totalClasses,
      totalAttended,
      totalAbsent,
      attendanceRate,
      averageScore,
      upcomingSessions,
      totalInvoices,
      paidInvoices,
      unpaidInvoices: totalInvoices - paidInvoices,
      pendingLeaveRequests
    };
  }

  private async countStudentClasses(studentId: string) {
    return this.prisma.enrollment.count({
      where: { studentId, NOT: { status: EnrollmentStatus.DROPPED } }
    });
  }

  private async countStudentAttendance(studentId: string, status: string) {
    return this.prisma.attendance.count({
      where: { studentId, status: status as any }
    });
  }

  private async calcStudentAverageScore(studentId: string) {
    const result = await this.prisma.assignmentResult.aggregate({
      where: { studentId },
      _avg: { score: true }
    });
    return Number((result._avg.score || 0).toFixed(2));
  }

  private async getUpcomingSessions(studentId: string) {
    const now = new Date();
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId, NOT: { status: EnrollmentStatus.DROPPED } },
      select: { classId: true }
    });
    if (enrollments.length === 0) return [];

    const classIds = enrollments.map((e) => e.classId);
    const sessions = await this.prisma.scheduleSession.findMany({
      where: {
        classId: { in: classIds },
        studyDate: { gte: now }
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
      orderBy: { studyDate: 'asc' },
      take: 5
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

  private async countStudentInvoices(studentId: string) {
    return this.prisma.invoice.count({ where: { studentId } });
  }

  private async countStudentInvoicesByStatus(studentId: string, status: InvoiceStatus) {
    return this.prisma.invoice.count({ where: { studentId, status } });
  }

  private async countPendingLeaveRequests(accountId: string) {
    return this.prisma.request.count({
      where: {
        senderAccountId: accountId,
        type: RequestType.LEAVE_REQUEST,
        status: RequestStatus.PENDING
      }
    });
  }

  // ==================== ADMIN DASHBOARD ====================

  async getAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      totalRevenue,
      lastMonthRevenue,
      studentsThisMonth,
      lastMonthStudents,
      activeClasses,
      pendingLeaves,
      pendingSalaryComplaints,
      monthlyRevenue,
      topCourses,
      recentEnrollments
    ] = await Promise.all([
      this.prisma.student.count(),
      this.prisma.teacher.count(),
      this.prisma.course.count(),
      this.calcTotalRevenue(startOfMonth, now),
      this.calcTotalRevenue(startOfLastMonth, endOfLastMonth),
      this.countNewStudents(startOfMonth, now),
      this.countNewStudents(startOfLastMonth, endOfLastMonth),
      this.countActiveClasses(),
      this.prisma.request.count({ where: { type: RequestType.LEAVE_REQUEST, status: RequestStatus.PENDING } }),
      this.prisma.request.count({ where: { type: RequestType.SALARY_COMPLAINT, status: RequestStatus.PENDING } }),
      this.getMonthlyRevenue(6),
      this.getTopCourses(5),
      this.getRecentEnrollments(10)
    ]);

    const revenueGrowth =
      lastMonthRevenue > 0 ? Number((((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)) : 0;
    const studentGrowth =
      lastMonthStudents > 0
        ? Number((((studentsThisMonth - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1))
        : 0;

    return {
      totalStudents,
      totalTeachers,
      totalCourses,
      totalRevenue,
      revenueGrowth,
      studentGrowth,
      newStudentsThisMonth: studentsThisMonth,
      activeClasses,
      pendingLeaves,
      pendingSalaryComplaints,
      monthlyRevenue,
      topCourses,
      recentEnrollments
    };
  }

  private async calcTotalRevenue(from: Date, to: Date) {
    const result = await this.prisma.invoice.aggregate({
      where: { status: InvoiceStatus.PAID, createdAt: { gte: from, lte: to } },
      _sum: { amount: true }
    });
    return Number(result._sum.amount || 0);
  }

  private async countNewStudents(from: Date, to: Date) {
    return this.prisma.student.count({
      where: { profile: { account: { createdAt: { gte: from, lte: to } } } }
    });
  }

  private async countActiveClasses() {
    return this.prisma.class.count();
  }

  private async getMonthlyRevenue(months: number) {
    const result: { month: string; revenue: number; enrollments: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const [rev, enr] = await Promise.all([
        this.prisma.invoice.aggregate({
          where: { status: InvoiceStatus.PAID, createdAt: { gte: start, lte: end } },
          _sum: { amount: true }
        }),
        this.prisma.enrollment.count({
          where: { createdAt: { gte: start, lte: end } }
        })
      ]);
      const monthLabel = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result.push({ month: monthLabel, revenue: Number(rev._sum.amount || 0), enrollments: enr });
    }
    return result;
  }

  private async getTopCourses(limit: number) {
    const courses = await this.prisma.course.findMany({
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

    return courses
      .map((c) => ({
        courseId: c.courseId,
        courseName: c.courseName,
        totalStudents: c.classes.reduce((sum, cl) => sum + cl.enrollments.length, 0),
        totalRevenue: Number(
          c.classes.reduce(
            (sum, cl) =>
              sum + cl.Invoice.filter((i) => i.status === InvoiceStatus.PAID).reduce((s, i) => s + Number(i.amount), 0),
            0
          )
        )
      }))
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, limit);
  }

  private async getRecentEnrollments(limit: number) {
    const enrollments = await this.prisma.enrollment.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        enrollmentId: true,
        createdAt: true,
        student: { select: { profile: { select: { fullName: true } } } },
        class: { select: { course: { select: { courseName: true } } } }
      }
    });

    return enrollments.map((e) => ({
      enrollmentId: e.enrollmentId,
      studentName: e.student.profile?.fullName || 'N/A',
      courseName: e.class.course.courseName,
      createdAt: e.createdAt.toISOString()
    }));
  }

  // ==================== FINANCE DASHBOARD ====================

  async getFinanceDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalRevenue,
      totalPaid,
      totalPending,
      totalCancelled,
      thisMonthRevenue,
      thisMonthPaid,
      thisMonthPending,
      lastMonthRevenue,
      lastMonthPaid,
      lastMonthPending,
      monthlyRevenue,
      revenueByCourse,
      recentTransactions
    ] = await Promise.all([
      this.prisma.invoice.aggregate({ _sum: { amount: true } }).then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({ where: { status: InvoiceStatus.PAID }, _sum: { amount: true } })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({ where: { status: InvoiceStatus.PENDING }, _sum: { amount: true } })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({ where: { status: InvoiceStatus.CANCELLED }, _sum: { amount: true } })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({ where: { createdAt: { gte: startOfMonth, lte: now } }, _sum: { amount: true } })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({
          where: { status: InvoiceStatus.PAID, createdAt: { gte: startOfMonth, lte: now } },
          _sum: { amount: true }
        })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({
          where: { status: InvoiceStatus.PENDING, createdAt: { gte: startOfMonth, lte: now } },
          _sum: { amount: true }
        })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }, _sum: { amount: true } })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({
          where: { status: InvoiceStatus.PAID, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
          _sum: { amount: true }
        })
        .then((r) => Number(r._sum.amount || 0)),
      this.prisma.invoice
        .aggregate({
          where: { status: InvoiceStatus.PENDING, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
          _sum: { amount: true }
        })
        .then((r) => Number(r._sum.amount || 0)),
      this.getMonthlyRevenue(6),
      this.getRevenueByCourse(),
      this.getRecentTransactions(10)
    ]);

    const revenueGrowth =
      lastMonthRevenue > 0 ? Number((((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)) : 0;
    const paidGrowth =
      lastMonthPaid > 0 ? Number((((thisMonthPaid - lastMonthPaid) / lastMonthPaid) * 100).toFixed(1)) : 0;
    const pendingGrowth =
      lastMonthPending > 0 ? Number((((thisMonthPending - lastMonthPending) / lastMonthPending) * 100).toFixed(1)) : 0;

    return {
      totalRevenue,
      totalPaid,
      totalPending,
      totalCancelled,
      revenueGrowth,
      paidGrowth,
      pendingGrowth,
      monthlyRevenue,
      revenueByCourse,
      recentTransactions
    };
  }

  private async getRevenueByCourse() {
    const courses = await this.prisma.course.findMany({
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

    return courses
      .map((c) => ({
        courseId: c.courseId,
        courseName: c.courseName,
        totalRevenue: Number(
          c.classes.reduce((sum, cl) => sum + cl.Invoice.reduce((s, i) => s + Number(i.amount), 0), 0)
        )
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .filter((c) => c.totalRevenue > 0);
  }

  private async getRecentTransactions(limit: number) {
    const invoices = await this.prisma.invoice.findMany({
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

    return invoices.map((i) => ({
      transactionId: i.transactionId,
      studentName: i.student.profile?.fullName || 'N/A',
      courseName: i.class.course.courseName,
      amount: i.amount.toString(),
      status: i.status,
      createdAt: i.createdAt.toISOString()
    }));
  }

  // ==================== TRAINING DASHBOARD ====================

  async getTrainingDashboard() {
    const now = new Date();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalCourses,
      totalClasses,
      totalSessions,
      totalStudents,
      lastMonthStudents,
      attendanceRate,
      averageScore,
      topCourses,
      scoreDistribution,
      monthlyEnrollments
    ] = await Promise.all([
      this.prisma.course.count(),
      this.prisma.class.count(),
      this.prisma.scheduleSession.count({ where: { status: ClassSessionStatus.ENDED } }),
      this.prisma.enrollment.count({ where: { NOT: { status: EnrollmentStatus.DROPPED } } }),
      this.prisma.enrollment.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, NOT: { status: EnrollmentStatus.DROPPED } }
      }),
      this.calcOverallAttendanceRate(),
      this.calcOverallAverageScore(),
      this.getTopCourses(5),
      this.getOverallScoreDistribution(),
      this.getMonthlyEnrollments(6)
    ]);

    const courseGrowth = 0;
    const classGrowth = 0;
    const studentGrowth =
      lastMonthStudents > 0 ? Number((((totalStudents - lastMonthStudents) / lastMonthStudents) * 100).toFixed(1)) : 0;

    return {
      totalCourses,
      totalClasses,
      totalSessions,
      totalStudents,
      courseGrowth,
      classGrowth,
      studentGrowth,
      attendanceRate,
      averageScore,
      topCourses,
      scoreDistribution,
      monthlyEnrollments
    };
  }

  private async calcOverallAttendanceRate() {
    const total = await this.prisma.attendance.count();
    if (total === 0) return 0;
    const present = await this.prisma.attendance.count({
      where: { status: { in: ['PRESENT', 'LATE'] as any } }
    });
    return Math.round((present / total) * 100);
  }

  private async calcOverallAverageScore() {
    const result = await this.prisma.assignmentResult.aggregate({
      _avg: { score: true }
    });
    return Number((result._avg.score || 0).toFixed(2));
  }

  private async getOverallScoreDistribution() {
    const results = await this.prisma.assignmentResult.findMany({
      select: { score: true }
    });

    let excellent = 0,
      good = 0,
      average = 0,
      weak = 0,
      poor = 0;

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

  private async getMonthlyEnrollments(months: number) {
    const result: { month: string; enrollments: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const enr = await this.prisma.enrollment.count({
        where: { createdAt: { gte: start, lte: end } }
      });
      const monthLabel = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result.push({ month: monthLabel, enrollments: enr });
    }
    return result;
  }

  async getRequestDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalRequests, thisMonthRequests, lastMonthRequests, statusCounts, typeCounts, recentRequests] =
      await Promise.all([
        this.prisma.request.count(),
        this.prisma.request.count({ where: { createdAt: { gte: startOfMonth, lte: now } } }),
        this.prisma.request.count({ where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } } }),
        this.prisma.request.groupBy({ by: ['status'], _count: true }),
        this.prisma.request.groupBy({ by: ['type'], _count: true }),
        this.prisma.request.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            requestId: true,
            type: true,
            reason: true,
            status: true,
            createdAt: true,
            senderAccount: { select: { accountId: true, username: true } }
          }
        })
      ]);

    const countByStatus = (status: string) => statusCounts.find((s) => s.status === status)?._count ?? 0;
    const countByType = (type: string) => typeCounts.find((t) => t.type === type)?._count ?? 0;

    const requestsGrowth =
      lastMonthRequests > 0
        ? Number((((thisMonthRequests - lastMonthRequests) / lastMonthRequests) * 100).toFixed(1))
        : 0;

    const monthlyRequests: { month: string; requests: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await this.prisma.request.count({
        where: { createdAt: { gte: start, lte: end } }
      });
      const monthLabel = `${d.getMonth() + 1}/${d.getFullYear()}`;
      monthlyRequests.push({ month: monthLabel, requests: count });
    }

    return {
      totalRequests,
      pendingRequests: countByStatus(RequestStatus.PENDING),
      approvedRequests: countByStatus(RequestStatus.APPROVED),
      rejectedRequests: countByStatus(RequestStatus.REJECTED),
      cancelledRequests: countByStatus(RequestStatus.CANCELLED),
      resolvedRequests: countByStatus(RequestStatus.RESOLVED),
      requestsGrowth,
      requestsByType: typeCounts.map((t) => ({ type: t.type, count: t._count })),
      requestsByStatus: statusCounts.map((s) => ({ status: s.status, count: s._count })),
      monthlyRequests,
      recentRequests: recentRequests.map((r) => ({
        requestId: r.requestId,
        type: r.type,
        reason: r.reason,
        status: r.status,
        senderName: r.senderAccount.username,
        createdAt: r.createdAt
      }))
    };
  }
}
