import { Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, InvoiceStatus, RequestStatus } from '@prisma/client';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { StudentService } from 'modules/student/services/student.service';

import { DashboardRepository } from '../repositories/dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepo: DashboardRepository,
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
      this.dashboardRepo.countEndedSessionsByTeacherId(teacherId),
      this.dashboardRepo.calcTotalIncomeByTeacherId(teacherId),
      this.dashboardRepo.countClassesByTeacherId(teacherId),
      this.countStudentsByTeacherId(teacherId),
      this.getTopStudents(teacherId),
      this.getScoreDistributionByTeacherId(teacherId),
      this.calcAttendanceRate(teacherId),
      this.dashboardRepo.countPendingScheduleChangesByAccount(accountId),
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

  private async countStudentsByTeacherId(teacherId: string) {
    const classes = await this.dashboardRepo.findClassIdsByTeacherId(teacherId);
    if (classes.length === 0) return 0;
    return this.dashboardRepo.countEnrollmentsByClassIds(classes.map((c) => c.classId));
  }

  private async getTopStudents(teacherId: string) {
    const results = await this.dashboardRepo.getTopStudentsByTeacherId(teacherId);
    if (results.length === 0) return [];

    const studentIds = results.map((r) => r.studentId);
    const students = await this.dashboardRepo.findStudentsByIds(studentIds);
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

  private async getScoreDistributionByTeacherId(teacherId: string) {
    const results = await this.dashboardRepo.findScoresByTeacherId(teacherId);
    const dist = { excellent: 0, good: 0, average: 0, weak: 0, poor: 0 };
    for (const r of results) {
      const score = Number(r.score);
      if (score >= 8.5) dist.excellent++;
      else if (score >= 7) dist.good++;
      else if (score >= 5) dist.average++;
      else if (score >= 4) dist.weak++;
      else dist.poor++;
    }
    return dist;
  }

  private async calcAttendanceRate(teacherId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const attendances = await this.dashboardRepo.findAttendancesByTeacherIdAndMonth(
      teacherId,
      startOfMonth,
      endOfMonth
    );

    const total = attendances.length;
    if (total === 0) return 0;
    const present = attendances.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    return Math.round((present / total) * 100);
  }

  private async getTodaySessions(teacherId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const sessions = await this.dashboardRepo.findSessionsByTeacherIdAndDateRange(teacherId, startOfDay, endOfDay);
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

  // ==================== STUDENT DASHBOARD ====================

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
      this.dashboardRepo.countEnrollmentsByStudentId(studentId),
      this.dashboardRepo.countAttendanceByStudentIdAndStatus(studentId, 'PRESENT'),
      this.dashboardRepo.countAttendanceByStudentIdAndStatus(studentId, 'ABSENT'),
      this.dashboardRepo.calcAvgScoreByStudentId(studentId),
      this.getUpcomingSessions(studentId),
      this.dashboardRepo.countInvoicesByStudentId(studentId),
      this.dashboardRepo.countInvoicesByStudentIdAndStatus(studentId, InvoiceStatus.PAID),
      this.dashboardRepo.countPendingLeaveRequestsByAccount(accountId)
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

  private async getUpcomingSessions(studentId: string) {
    const now = new Date();
    const enrollments = await this.dashboardRepo.findActiveEnrollmentClassIds(studentId);
    if (enrollments.length === 0) return [];

    const classIds = enrollments.map((e) => e.classId);
    const sessions = await this.dashboardRepo.findUpcomingSessionsByClassIds(classIds, now);
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
      this.dashboardRepo.countStudents(),
      this.dashboardRepo.countTeachers(),
      this.dashboardRepo.countCourses(),
      this.dashboardRepo.calcRevenueByDateRange(startOfMonth, now),
      this.dashboardRepo.calcRevenueByDateRange(startOfLastMonth, endOfLastMonth),
      this.dashboardRepo.countStudentsByAccountDateRange(startOfMonth, now),
      this.dashboardRepo.countStudentsByAccountDateRange(startOfLastMonth, endOfLastMonth),
      this.dashboardRepo.countClasses(),
      this.dashboardRepo.countRequestsByTypeAndStatus('LEAVE_REQUEST', 'PENDING'),
      this.dashboardRepo.countRequestsByTypeAndStatus('SALARY_COMPLAINT', 'PENDING'),
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

  private async getMonthlyRevenue(months: number) {
    const result: { month: string; revenue: number; enrollments: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const [revenue, enrollments] = await this.dashboardRepo.getMonthlyRevenuePerMonth(start, end);
      const monthLabel = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result.push({ month: monthLabel, revenue, enrollments });
    }
    return result;
  }

  private async getTopCourses(limit: number) {
    const courses = await this.dashboardRepo.findCoursesWithClassesAndEnrollments();
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
    const enrollments = await this.dashboardRepo.findRecentEnrollments(limit);
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
      this.dashboardRepo.aggregateInvoiceAmount(),
      this.dashboardRepo.aggregateInvoiceAmount({ status: InvoiceStatus.PAID }),
      this.dashboardRepo.aggregateInvoiceAmount({ status: InvoiceStatus.PENDING }),
      this.dashboardRepo.aggregateInvoiceAmount({ status: InvoiceStatus.CANCELLED }),
      this.dashboardRepo.aggregateInvoiceAmount({ createdAt: { gte: startOfMonth, lte: now } }),
      this.dashboardRepo.aggregateInvoiceAmount({
        status: InvoiceStatus.PAID,
        createdAt: { gte: startOfMonth, lte: now }
      }),
      this.dashboardRepo.aggregateInvoiceAmount({
        status: InvoiceStatus.PENDING,
        createdAt: { gte: startOfMonth, lte: now }
      }),
      this.dashboardRepo.aggregateInvoiceAmount({ createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } }),
      this.dashboardRepo.aggregateInvoiceAmount({
        status: InvoiceStatus.PAID,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }),
      this.dashboardRepo.aggregateInvoiceAmount({
        status: InvoiceStatus.PENDING,
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      }),
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
    const courses = await this.dashboardRepo.findCoursesWithInvoices();
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
    const invoices = await this.dashboardRepo.findRecentInvoices(limit);
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
      this.dashboardRepo.countCourses(),
      this.dashboardRepo.countClasses(),
      this.dashboardRepo.countEndedSessions(),
      this.dashboardRepo.countEnrollmentsNotDropped(),
      this.dashboardRepo.countEnrollmentsByDateRange(startOfLastMonth, endOfLastMonth),
      this.calcOverallAttendanceRate(),
      this.dashboardRepo.aggregateAvgScore(),
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
    const total = await this.dashboardRepo.countAttendance();
    if (total === 0) return 0;
    const present = await this.dashboardRepo.countAttendanceByStatusIn(['PRESENT', 'LATE']);
    return Math.round((present / total) * 100);
  }

  private async getOverallScoreDistribution() {
    const results = await this.dashboardRepo.findAllScores();
    const dist = { excellent: 0, good: 0, average: 0, weak: 0, poor: 0 };
    for (const r of results) {
      const score = Number(r.score);
      if (score >= 8.5) dist.excellent++;
      else if (score >= 7) dist.good++;
      else if (score >= 5) dist.average++;
      else if (score >= 4) dist.weak++;
      else dist.poor++;
    }
    return dist;
  }

  private async getMonthlyEnrollments(months: number) {
    const result: { month: string; enrollments: number }[] = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const enrollments = await this.dashboardRepo.countRequestsByDateRange(start, end);
      const monthLabel = `${d.getMonth() + 1}/${d.getFullYear()}`;
      result.push({ month: monthLabel, enrollments });
    }
    return result;
  }

  // ==================== REQUEST DASHBOARD ====================

  async getRequestDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalRequests, thisMonthRequests, lastMonthRequests, statusCounts, typeCounts, recentRequests] =
      await Promise.all([
        this.dashboardRepo.countRequestsInRange(new Date('1970-01-01'), now),
        this.dashboardRepo.countRequestsInRange(startOfMonth, now),
        this.dashboardRepo.countRequestsInRange(startOfLastMonth, endOfLastMonth),
        this.dashboardRepo.groupRequestsByStatus(),
        this.dashboardRepo.groupRequestsByType(),
        this.dashboardRepo.findRecentRequests(10)
      ]);

    const countByStatus = (status: string) => statusCounts.find((s) => s.status === status)?._count ?? 0;

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
      const count = await this.dashboardRepo.countRequestsInRange(start, end);
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
