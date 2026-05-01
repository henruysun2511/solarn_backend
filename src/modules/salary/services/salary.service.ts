import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';

import { SalaryRepository } from '../repositories/salary.repository';

export interface SalaryPreviewItem {
  teacherId: string;
  teacherCode: string;
  fullName: string | null;
  salaryRate: Prisma.Decimal;
  month: number;
  year: number;
  salaryDate: Date;
  totalSessions: number;
  sessionEarnings: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
}

@Injectable()
export class SalaryService {
  constructor(
    private readonly salaryRepo: SalaryRepository,
    private readonly teacherService: TeacherService,
    private readonly scheduleSessionService: ScheduleSessionService
  ) {}

  async previewMonthlySalary(input: { year: number; month: number }) {
    const { salaryDate, nextMonthDate } = this.getMonthRange(input.year, input.month);

    const teachers = await this.teacherService.findTeachersForSalary();
    const sessions = await this.scheduleSessionService.findEndedSessionsWithinRange(salaryDate, nextMonthDate);

    const earningsByTeacher = new Map<string, { totalSessions: number; sessionEarnings: Prisma.Decimal }>();
    for (const session of sessions) {
      const teacherId = session.class.teacherId;
      const tuitionFee = session.class.course.tuitionFee;
      const totalSessions = session.class.course.totalSessions;

      const perSession = totalSessions > 0 ? tuitionFee.div(totalSessions) : new Prisma.Decimal(0);

      const existing = earningsByTeacher.get(teacherId);
      if (existing) {
        existing.totalSessions += 1;
        existing.sessionEarnings = existing.sessionEarnings.add(perSession);
      } else {
        earningsByTeacher.set(teacherId, {
          totalSessions: 1,
          sessionEarnings: perSession
        });
      }
    }

    return teachers.map((t) => {
      const agg = earningsByTeacher.get(t.teacherId);
      const sessionEarnings = agg?.sessionEarnings ?? new Prisma.Decimal(0);
      const totalSessions = agg?.totalSessions ?? 0;
      const totalAmount = t.salaryRate.add(sessionEarnings);

      return {
        teacherId: t.teacherId,
        teacherCode: t.teacherCode,
        fullName: t.profile?.fullName ?? null,
        salaryRate: t.salaryRate,
        month: input.month,
        year: input.year,
        salaryDate,
        totalSessions,
        sessionEarnings,
        totalAmount
      };
    });
  }

  async saveMonthlySalary(input: { year: number; month: number }) {
    const { salaryDate } = this.getMonthRange(input.year, input.month);
    const existingCount = await this.salaryRepo.countBySalaryDate(salaryDate);

    if (existingCount > 0) {
      throw new ConflictException('Bảng lương tháng này đã tồn tại');
    }

    const preview = await this.previewMonthlySalary(input);
    const createResult = await this.salaryRepo.createManySalaries(
      preview.map((p) => ({
        teacherId: p.teacherId,
        salaryDate: p.salaryDate,
        totalSessions: p.totalSessions,
        bonus: new Prisma.Decimal(0),
        deduction: new Prisma.Decimal(0),
        totalAmount: p.totalAmount
      }))
    );

    return {
      salaryDate,
      year: input.year,
      month: input.month,
      createdCount: createResult.count,
      preview
    };
  }

  private getMonthRange(year: number, month: number): { salaryDate: Date; nextMonthDate: Date } {
    const salaryDate = new Date(Date.UTC(year, month - 1, 1));
    const nextMonthDate = new Date(Date.UTC(year, month, 1));
    return { salaryDate, nextMonthDate };
  }

  findSalaryById(salaryId: string) {
    return this.salaryRepo.findSalaryById(salaryId);
  }
}
