import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { CourseService } from 'modules/course/services/course.service';
import { EnrollmentService } from 'modules/enrollment/services/enrollment.service';
import { ScheduleTemplateService } from 'modules/schedule-template/services/schedule-template.service';

import { CreateClassDto } from '../dtos';
import { ClassRepository } from '../repositories/class.repository';
import { generateScheduleSessions, normalizeDate, parseWeekdays } from '../utils';

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepo: ClassRepository,
    private readonly courseService: CourseService,
    private readonly scheduleTemplateService: ScheduleTemplateService,
    private readonly enrollmentService: EnrollmentService
  ) {}

  async create(dto: CreateClassDto) {
    const totalSessions = await this.courseService.getTotalSessions(dto.courseId);
    const scheduleTemplate = await this.scheduleTemplateService.getActiveById(dto.scheduleTemplateId);

    const allowedWeekdays = parseWeekdays(scheduleTemplate.weekdays);
    const startDate = normalizeDate(dto.startDate);
    const sessions = generateScheduleSessions(startDate, allowedWeekdays, scheduleTemplate.shiftCode, totalSessions);

    return this.classRepo.create({
      classData: {
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
}
