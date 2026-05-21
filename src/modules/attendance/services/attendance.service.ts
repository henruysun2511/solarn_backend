import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';

import { AttendanceRepository, UpsertAttendanceInput } from '../repositories/attendance.repository';
import { ATTENDANCE_ERRORS } from '../constants/attendance-errors.constant';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepo: AttendanceRepository,
    private readonly scheduleSessionService: ScheduleSessionService,
    private readonly enrollmentService: EnrollmentService
  ) {}

  private async assertStudentsBelongToSessionClass(items: UpsertAttendanceInput[]): Promise<void> {
    if (items.length === 0) return;

    const sessionIds = Array.from(new Set(items.map((i) => i.sessionId)));
    const studentIds = Array.from(new Set(items.map((i) => i.studentId)));

    const sessionMetaMap = await this.scheduleSessionService.getSessionMetaMap(sessionIds);
    const classIds = Array.from(new Set(Array.from(sessionMetaMap.values()).map((m) => m.classId)));

    const enrolledPairs = await this.enrollmentService.getEnrolledPairs(studentIds, classIds);

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      const meta = sessionMetaMap.get(item.sessionId);

      if (!meta) {
        throw new BadRequestException({
          ...ATTENDANCE_ERRORS.SESSION_NOT_FOUND,
          index,
          studentId: item.studentId,
          sessionId: item.sessionId
        });
      }

      if (meta.status !== 'IN_PROGRESS') {
        throw new BadRequestException({
          ...ATTENDANCE_ERRORS.SESSION_NOT_IN_PROGRESS,
          index,
          studentId: item.studentId,
          sessionId: item.sessionId,
          status: meta.status
        });
      }

      if (!enrolledPairs.has(`${item.studentId}:${meta.classId}`)) {
        throw new BadRequestException({
          ...ATTENDANCE_ERRORS.STUDENT_NOT_IN_CLASS,
          index,
          studentId: item.studentId,
          sessionId: item.sessionId,
          classId: meta.classId
        });
      }
    }
  }

  async upsertMany(items: UpsertAttendanceInput[]) {
    await this.assertStudentsBelongToSessionClass(items);
    return this.attendanceRepo.upsertMany(items);
  }

  findEndedAttendancesForProgress(studentIds: string[], classIds: string[]) {
    return this.attendanceRepo.findEndedAttendancesForProgress(studentIds, classIds);
  }

  findBySessionId(sessionId: string) {
    return this.attendanceRepo.findBySessionId(sessionId);
  }
}
