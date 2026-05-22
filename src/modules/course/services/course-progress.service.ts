import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceStatus } from '@prisma/client';
import { AttendanceService } from 'modules/attendance/services/attendance.service';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';
import { StudentService } from 'modules/student/services/student.service';

import { CourseRepository } from '../repositories/course.repository';

@Injectable()
export class CourseProgressService {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly attendanceService: AttendanceService,
    private readonly enrollmentService: EnrollmentService,
    private readonly scheduleSessionService: ScheduleSessionService,
    private readonly studentService: StudentService
  ) {}

  /**
   * Luồng hoạt động (progress theo khóa học):
   * 1) Validate courseId (khóa học tồn tại).
   * 2) Lấy danh sách enrollment còn hiệu lực trong tất cả lớp thuộc khóa học (trừ DROPPED).
   * 3) Gom `classIds` và `studentIds` để query theo batch.
   * 4) Lấy thống kê buổi học theo từng lớp: tổng số buổi (total) và số buổi đã kết thúc (ended).
   * 5) Lấy dữ liệu điểm danh cho các buổi đã kết thúc (ENDED) để tính attended/absent.
   * 6) Tổng hợp kết quả theo từng học viên trong từng lớp:
   *    - attendedSessions: số buổi PRESENT/LATE
   *    - absentSessions: số buổi ABSENT
   *    - unmarkedSessions: số buổi ENDED nhưng chưa có attendance (ended - (attended+absent))
   *    - progressPercent: % tiến độ lớp = ended/total * 100 (làm tròn 2 chữ số)
   */
  async getStudentProgressList(courseId: string) {
    // (1) Validate khóa học
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new BadRequestException('Khóa học không tồn tại');
    }

    // (2) Lấy enrollment theo khóa học (đúng module enrollment)
    const enrollments = await this.enrollmentService.findActiveEnrollmentsByCourseId(courseId);
    if (enrollments.length === 0) {
      return {
        courseId,
        courseName: course.courseName,
        totalSessions: course.totalSessions,
        students: []
      };
    }

    // (3) Chuẩn hóa đầu vào để query batch
    const classIds = Array.from(new Set(enrollments.map((e) => e.classId)));
    const studentIds = Array.from(new Set(enrollments.map((e) => e.studentId)));

    // (4) + (5) Query song song: stats buổi học theo lớp & điểm danh cho các buổi đã ENDED
    const [sessionStatsByClassId, attendances] = await Promise.all([
      this.scheduleSessionService.getClassProgressStatsMap(classIds),
      this.attendanceService.findEndedAttendancesForProgress(studentIds, classIds)
    ]);

    // (6) Build map đếm attended/absent theo cặp (studentId, classId)
    const attendanceCountMap = new Map<string, { attended: number; absent: number }>();
    for (const row of attendances) {
      const classId = row.session.classId;
      const key = `${row.studentId}:${classId}`;
      const current = attendanceCountMap.get(key) ?? { attended: 0, absent: 0 };

      if (row.status === AttendanceStatus.ABSENT) {
        attendanceCountMap.set(key, { ...current, absent: current.absent + 1 });
      } else {
        // PRESENT | LATE
        attendanceCountMap.set(key, { ...current, attended: current.attended + 1 });
      }
    }

    // (7) Gộp dữ liệu enrollment + stats + attendance để ra list kết quả
    const students = enrollments.map((enrollment) => {
      const stats = sessionStatsByClassId.get(enrollment.classId) ?? { total: 0, ended: 0 };
      const key = `${enrollment.studentId}:${enrollment.classId}`;
      const counts = attendanceCountMap.get(key) ?? { attended: 0, absent: 0 };

      const marked = counts.attended + counts.absent;
      const unmarked = Math.max(0, stats.ended - marked);
      const progressPercent = stats.total === 0 ? 0 : Math.round((stats.ended / stats.total) * 10000) / 100;

      return {
        studentId: enrollment.student.studentId,
        studentCode: enrollment.student.studentCode,
        fullName: enrollment.student.profile?.fullName ?? null,
        email: enrollment.student.profile?.email ?? null,
        phone: enrollment.student.profile?.phone ?? null,
        classId: enrollment.class.classId,
        roomCode: enrollment.class.roomCode,
        classStartDate: enrollment.class.startDate,
        enrollmentStatus: enrollment.status,
        totalSessions: stats.total,
        endedSessions: stats.ended,
        attendedSessions: counts.attended,
        absentSessions: counts.absent,
        unmarkedSessions: unmarked,
        progressPercent
      };
    });

    return {
      courseId,
      courseName: course.courseName,
      totalSessions: course.totalSessions,
      students
    };
  }

  async findMyStudentProgress(accountId: string) {
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) throw new NotFoundException('Không tìm thấy học sinh');

    const { studentId } = student;

    const enrollments = await this.enrollmentService.findActiveEnrollmentsByStudentId(studentId);
    if (enrollments.length === 0) return [];

    const classIds = enrollments.map((e) => e.classId);

    const [sessionStatsByClassId, attendances] = await Promise.all([
      this.scheduleSessionService.getClassProgressStatsMap(classIds),
      this.attendanceService.findEndedAttendancesForProgress([studentId], classIds)
    ]);

    const attendanceCountMap = new Map<string, { attended: number; absent: number }>();
    for (const row of attendances) {
      const classId = row.session.classId;
      const key = `${row.studentId}:${classId}`;
      const current = attendanceCountMap.get(key) ?? { attended: 0, absent: 0 };
      if (row.status === AttendanceStatus.ABSENT) {
        attendanceCountMap.set(key, { ...current, absent: current.absent + 1 });
      } else {
        attendanceCountMap.set(key, { ...current, attended: current.attended + 1 });
      }
    }

    return enrollments.map((enrollment) => {
      const stats = sessionStatsByClassId.get(enrollment.classId) ?? { total: 0, ended: 0 };
      const key = `${studentId}:${enrollment.classId}`;
      const counts = attendanceCountMap.get(key) ?? { attended: 0, absent: 0 };

      const marked = counts.attended + counts.absent;
      const unmarked = Math.max(0, stats.ended - marked);
      const progressPercent = stats.total === 0 ? 0 : Math.round((stats.ended / stats.total) * 10000) / 100;

      return {
        classId: enrollment.class.classId,
        roomCode: enrollment.class.roomCode,
        courseName: enrollment.class.course?.courseName ?? '',
        courseId: enrollment.class.course?.courseId ?? '',
        totalSessions: enrollment.class.course?.totalSessions ?? stats.total,
        endedSessions: stats.ended,
        attendedSessions: counts.attended,
        absentSessions: counts.absent,
        unmarkedSessions: unmarked,
        progressPercent
      };
    });
  }
}
