import { BadRequestException, Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { IAccountRequest } from 'common/interfaces';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';
import { StudentService } from 'modules/student/services/student.service';
import { paginate } from 'shared/helpers';

import { AttendanceRepository, UpsertAttendanceInput } from '../repositories/attendance.repository';
import { MyAttendanceSearchDto } from '../dtos';
import { ATTENDANCE_ERRORS } from '../constants/attendance-errors.constant';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly attendanceRepo: AttendanceRepository,
    private readonly scheduleSessionService: ScheduleSessionService,
    private readonly enrollmentService: EnrollmentService,
    private readonly studentService: StudentService
  ) {}

  private async assertStudentsBelongToSessionClass(items: UpsertAttendanceInput[]): Promise<void> {
    if (items.length === 0) return;

    // (1) Chuẩn hoá input theo batch để query tối ưu:
    // - Lấy danh sách sessionIds và studentIds duy nhất từ payload.
    const sessionIds = Array.from(new Set(items.map((i) => i.sessionId)));
    const studentIds = Array.from(new Set(items.map((i) => i.studentId)));

    // (2) Lấy meta của các buổi học (sessionId -> { classId, status, ... })
    // để biết mỗi session thuộc lớp nào và trạng thái hiện tại.
    const sessionMetaMap = await this.scheduleSessionService.getSessionMetaMap(sessionIds);

    // (3) Từ meta, suy ra danh sách classIds liên quan (unique) để validate enrollment theo batch.
    const classIds = Array.from(new Set(Array.from(sessionMetaMap.values()).map((m) => m.classId)));

    // (4) Lấy status enrollment theo cặp (studentId, classId) để vừa kiểm tra "thuộc lớp"
    // vừa enforce điều kiện: enrollment phải IN_PROGRESS.
    const enrollmentStatusMap = await this.enrollmentService.getEnrollmentStatusMap(studentIds, classIds);

    // (5) Validate từng item:
    // - session phải tồn tại
    // - session phải đang IN_PROGRESS (chỉ cho điểm danh khi đang diễn ra)
    // - student phải thuộc lớp của session đó
    // - enrollment của student trong lớp đó phải IN_PROGRESS
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

      const pairKey = `${item.studentId}:${meta.classId}`;
      const enrollmentStatus = enrollmentStatusMap.get(pairKey);

      if (!enrollmentStatus) {
        throw new BadRequestException({
          ...ATTENDANCE_ERRORS.STUDENT_NOT_IN_CLASS,
          index,
          studentId: item.studentId,
          sessionId: item.sessionId,
          classId: meta.classId
        });
      }

      if (enrollmentStatus !== EnrollmentStatus.IN_PROGRESS) {
        throw new BadRequestException({
          ...ATTENDANCE_ERRORS.ENROLLMENT_NOT_IN_PROGRESS,
          index,
          studentId: item.studentId,
          sessionId: item.sessionId,
          classId: meta.classId,
          enrollmentStatus
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

  async findMyAttendances(user: IAccountRequest, query: MyAttendanceSearchDto) {
    const student = await this.studentService.getStudentIdByAccountIdOrThrow(user.accountId);

    const [data, total] = await Promise.all([
      this.attendanceRepo.findMyAttendances(student, query),
      this.attendanceRepo.countMyAttendances(student, query)
    ]);
    return paginate(data, total, query);
  }
}
