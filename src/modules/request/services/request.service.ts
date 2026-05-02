import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { SalaryService } from 'modules/salary/services/salary.service';
import { StudentService } from 'modules/student/services/student.service';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ClassService } from 'modules/class/services/class.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';

import { RequestRepository } from '../repositories/request.repository';
import {
  CreateLeaveRequestDto,
  CreateSalaryComplaintDto,
  CreateScheduleChangeDto,
  CreateTransferRequestDto
} from '../dtos';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestRepo: RequestRepository,
    private readonly teacherService: TeacherService,
    private readonly salaryService: SalaryService,
    private readonly studentService: StudentService,
    private readonly enrollmentService: EnrollmentService,
    private readonly classService: ClassService,
    private readonly scheduleSessionService: ScheduleSessionService
  ) {}

  /**
   * Tạo request khiếu nại lương
   */
  async createSalaryComplaint(accountId: string, dto: CreateSalaryComplaintDto) {
    // 1) Tìm teacherId từ accountId
    const teacher = await this.teacherService.findTeacherByAccountId(accountId);
    if (!teacher) {
      throw new BadRequestException('Giáo viên không tồn tại');
    }

    // 2) Tìm salary theo salaryId
    const salary = await this.salaryService.findSalaryById(dto.salaryId);
    if (!salary) {
      throw new BadRequestException({
        message: 'Bảng lương không tồn tại',
        salaryId: dto.salaryId
      });
    }

    // 3) Kiểm tra teacherId khớp (giáo viên chỉ được khiếu nại bảng lương của chính mình)
    if (salary.teacherId !== teacher.teacherId) {
      throw new ConflictException({
        message: 'Không thể khiếu nại bảng lương của giáo viên khác',
        reason: 'TEACHER_ID_MISMATCH'
      });
    }

    // 4) Tạo request
    return this.requestRepo.createSalaryComplaint({
      senderAccountId: accountId,
      salaryId: dto.salaryId,
      proposedAmount: dto.proposedAmount,
      reason: dto.reason
    });
  }

  /**
   * Tạo request chuyển lớp
   */
  async createTransferRequest(accountId: string, dto: CreateTransferRequestDto) {
    // Lấy student từ accountId
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) throw new BadRequestException('Sinh viên không tồn tại');

    const studentId = student.studentId;

    // Kiểm tra student đang học lớp nguồn
    const enrollment = await this.enrollmentService.findByStudentAndClass(studentId, dto.fromClassId);
    if (!enrollment || enrollment.status === 'DROPPED') {
      throw new BadRequestException('Học sinh không đang học lớp nguồn');
    }

    // Kiểm tra trạng thái lớp nguồn
    const fromMeta = await this.classService.getClassMeta(dto.fromClassId);
    if (!fromMeta) throw new BadRequestException('Lớp nguồn không tồn tại');
    if (!fromMeta.isOngoing) throw new BadRequestException('Lớp nguồn không còn đang diễn ra');

    // Kiểm tra lớp đích
    const toMeta = await this.classService.getClassMeta(dto.toClassId);
    if (!toMeta) throw new BadRequestException('Lớp đích không tồn tại');
    if (!toMeta.isOngoing) throw new BadRequestException('Lớp đích không đang diễn ra');

    // Cùng khóa học
    if (fromMeta.courseId !== toMeta.courseId) {
      throw new BadRequestException('Hai lớp không cùng khóa học');
    }

    // Tạo request chuyển lớp
    return this.requestRepo.createTransferRequest({
      senderAccountId: accountId,
      fromClassId: dto.fromClassId,
      toClassId: dto.toClassId,
      reason: dto.reason
    });
  }

  /**
   * Tạo request bảo lưu
   */
  async createLeaveRequest(accountId: string, dto: CreateLeaveRequestDto) {
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) {
      throw new BadRequestException('Sinh viên không tồn tại');
    }

    const enrollment = await this.enrollmentService.findByIdWithStudentAndClass(dto.enrollmentId);
    if (!enrollment) {
      throw new BadRequestException({
        message: 'Enrollment không tồn tại',
        enrollmentId: dto.enrollmentId
      });
    }

    if (enrollment.studentId !== student.studentId) {
      throw new ConflictException({
        message: 'Không thể tạo bảo lưu cho enrollment của học viên khác',
        reason: 'ENROLLMENT_STUDENT_MISMATCH'
      });
    }

    if (enrollment.status !== 'IN_PROGRESS') {
      throw new BadRequestException({
        message: 'Enrollment phải ở trạng thái IN_PROGRESS',
        enrollmentId: dto.enrollmentId,
        status: enrollment.status
      });
    }

    const leaveStartDate = new Date(dto.leaveStartDate);
    const leaveEndDate = new Date(dto.leaveEndDate);

    if (Number.isNaN(leaveStartDate.getTime()) || Number.isNaN(leaveEndDate.getTime())) {
      throw new BadRequestException('Ngày bảo lưu không hợp lệ');
    }

    if (leaveEndDate < leaveStartDate) {
      throw new BadRequestException('Ngày kết thúc bảo lưu phải sau ngày bắt đầu');
    }

    const classId = enrollment.classId;
    const { totalSessions, endedSessions } = await this.scheduleSessionService.getClassProgressStats(classId);
    const progressAtRequest = totalSessions === 0 ? 0 : Math.round((endedSessions / totalSessions) * 10000) / 100;

    const reason = dto.reason || `Xin bảo lưu từ ${dto.leaveStartDate} đến ${dto.leaveEndDate}`;

    return this.requestRepo.createLeaveRequest({
      senderAccountId: accountId,
      enrollmentId: dto.enrollmentId,
      leaveStartDate,
      leaveEndDate,
      progressAtRequest,
      reason
    });
  }

  /**
   * Tạo request đổi ngày/ca buổi học
   * Rule bắt buộc: lịch đề xuất không được trùng với bất kỳ buổi học nào khác.
   */
  async createScheduleChangeRequest(accountId: string, dto: CreateScheduleChangeDto) {
    const teacher = await this.teacherService.findTeacherByAccountId(accountId);
    if (!teacher) {
      throw new BadRequestException('Giáo viên không tồn tại');
    }

    const session = await this.scheduleSessionService.findByIdWithClassTeacher(dto.sessionId);
    if (!session) {
      throw new BadRequestException('Buổi học không tồn tại');
    }

    if (session.class.teacherId !== teacher.teacherId) {
      throw new ConflictException({
        message: 'Không thể đổi lịch buổi học của giáo viên khác',
        reason: 'TEACHER_SESSION_MISMATCH'
      });
    }

    const proposedStudyDate = new Date(dto.proposedStudyDate);
    const conflict = await this.scheduleSessionService.findSessionConflict(
      dto.proposedShiftCode,
      proposedStudyDate,
      dto.sessionId
    );

    if (conflict) {
      throw new ConflictException({
        message: 'Lịch đề xuất bị trùng với buổi học khác',
        reason: 'SCHEDULE_SESSION_CONFLICT',
        conflict
      });
    }

    return this.requestRepo.createScheduleChangeRequest({
      senderAccountId: accountId,
      sessionId: dto.sessionId,
      proposedShiftCode: dto.proposedShiftCode,
      proposedStudyDate,
      reason: dto.reason
    });
  }
}
