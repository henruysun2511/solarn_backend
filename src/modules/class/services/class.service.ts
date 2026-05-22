import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EnrollmentStatus } from '@prisma/client';
import { CourseService } from 'modules/course/services/course.service';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ScheduleSessionService } from 'modules/schedule-session/services/schedule-session.service';
import { ScheduleTemplateService } from 'modules/schedule-template/services/schedule-template.service';
import { paginate } from 'shared/helpers';

import { CreateClassDto, ClassSearchByCourseDto } from '../dtos';
import { ClassRepository } from '../repositories/class.repository';
import { generateClassCode, generateScheduleSessions, normalizeDate, parseWeekdays } from '../utils';

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepo: ClassRepository,
    private readonly courseService: CourseService,
    private readonly scheduleTemplateService: ScheduleTemplateService,
    private readonly scheduleSessionService: ScheduleSessionService,
    private readonly enrollmentService: EnrollmentService
  ) {}

  /**
   * Tạo lớp (business rules):
   * - Lấy `totalSessions` từ `Course` để biết số buổi cần tạo.
   * - Lấy `ScheduleTemplate` để xác định các thứ được phép học và `shiftCode`.
   * - Sinh danh sách `sessions` (mỗi item: `{ shiftCode, studyDate }`).
   * - Kiểm tra xung đột phòng (`roomCode`):
   *     + Nếu tồn tại lớp khác dùng cùng `roomCode` mà có session trùng ngày+ca
   *       với bất kỳ session vừa sinh và lớp đó chưa hoàn thành (không phải tất cả session đều `ENDED`),
   *       thì chặn và trả `ConflictException` với `reason: CLASS_ROOM_SCHEDULE_CONFLICT`.
   *     + Nếu lớp cũ đã hoàn thành (tất cả session = `ENDED`) thì cho phép tái sử dụng `roomCode`.
   * - Kiểm tra xung đột giáo viên tương tự; nếu có thì trả `TEACHER_SCHEDULE_CONFLICT`.
   * - Nếu không có xung đột, tạo `Class` và tạo các `ScheduleSession` tương ứng trong transaction.
   */
  async create(dto: CreateClassDto) {
    // Tổng số buổi cần tạo theo course
    const totalSessions = await this.courseService.getTotalSessions(dto.courseId);

    // Lấy mẫu lịch để biết các weekday hợp lệ và shiftCode
    const scheduleTemplate = await this.scheduleTemplateService.getActiveById(dto.scheduleTemplateId);

    // Sinh danh sách session cần tạo (dùng để kiểm tra xung đột và tạo record)
    const allowedWeekdays = parseWeekdays(scheduleTemplate.weekdays);
    const startDate = normalizeDate(dto.startDate);
    const sessions = generateScheduleSessions(startDate, allowedWeekdays, scheduleTemplate.shiftCode, totalSessions);

    // Kiểm tra xung đột phòng: chỉ coi là conflict nếu có session trùng ngày+ca
    // với một lớp còn buổi chưa kết thúc.
    const roomConflicts = await this.classRepo.findRoomSessionConflicts(
      dto.roomCode,
      sessions.map((session) => ({
        shiftCode: session.shiftCode,
        studyDate: session.studyDate
      }))
    );

    if (roomConflicts.length > 0) {
      throw new ConflictException({
        message: 'Phòng đang bị trùng lịch với lớp khác',
        reason: 'CLASS_ROOM_SCHEDULE_CONFLICT',
        roomCode: dto.roomCode,
        conflicts: roomConflicts
      });
    }

    // Kiểm tra xung đột lịch giáo viên (nếu giáo viên đã có buổi ở cùng ngày+ca)
    const conflicts = await this.scheduleSessionService.findTeacherSessionConflicts(
      dto.teacherId,
      sessions.map((session) => ({
        shiftCode: session.shiftCode,
        studyDate: session.studyDate
      }))
    );

    if (conflicts.length > 0) {
      throw new ConflictException({
        message: 'Giáo viên bị trùng lịch với lớp khác',
        reason: 'TEACHER_SCHEDULE_CONFLICT',
        teacherId: dto.teacherId,
        conflicts
      });
    }

    // Nếu không có xung đột, tạo class và các sessions trong transaction
    // classCode: CHAR(7) theo format SEGxxxx
    const maxAttempts = 5;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await this.classRepo.create({
          classData: {
            classCode: generateClassCode('SEG'),
            roomCode: dto.roomCode,
            startDate,
            maxStudents: dto.maxStudents,
            courseId: dto.courseId,
            teacherId: dto.teacherId,
            scheduleTemplateId: dto.scheduleTemplateId
          },
          sessions: sessions.map((session) => ({
            shiftCode: session.shiftCode,
            studyDate: session.studyDate
          }))
        });
      } catch (error) {
        // Nếu có unique constraint cho class_code trong tương lai, retry để tránh trùng
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          if (attempt < maxAttempts) continue;
        }
        throw error;
      }
    }

    throw new ConflictException('Không thể tạo classCode hợp lệ');
  }

  async addStudentToClass(classId: string, studentId: string) {
    const classInfo = await this.classRepo.findById(classId);
    if (!classInfo) {
      throw new BadRequestException('Lớp không tồn tại');
    }

    const existing = await this.enrollmentService.findByStudentAndClass(studentId, classId);
    if (existing) {
      throw new ConflictException('Học sinh đã ở trong lớp');
    }

    const currentCount = await this.enrollmentService.countActiveByClassId(classId);
    if (currentCount >= classInfo.maxStudents) {
      throw new BadRequestException('Lớp đã đủ học sinh');
    }

    const now = new Date();
    const status = now >= classInfo.startDate ? EnrollmentStatus.IN_PROGRESS : EnrollmentStatus.NOT_STARTED;

    return this.enrollmentService.create(studentId, classId, status);
  }

  async getClassMeta(classId: string) {
    return this.classRepo.getClassMeta(classId);
  }

  async getTuitionFeeByClassIdOrThrow(classId: string): Promise<Prisma.Decimal> {
    const tuitionFee = await this.classRepo.getTuitionFeeByClassId(classId);
    if (!tuitionFee) {
      throw new BadRequestException('Lớp không tồn tại');
    }

    return tuitionFee;
  }

  async findAllByCourseId(courseId: string, query: ClassSearchByCourseDto) {
    const [classes, total] = await Promise.all([
      this.classRepo.findManyByCourseId(courseId, query),
      this.classRepo.countByCourseId(courseId)
    ]);

    const data = classes.map((c) => {
      const { _count, ...rest } = c;
      return {
        ...rest,
        registeredStudents: _count.enrollments
      };
    });

    return paginate(data, total, query);
  }
}
