import { Injectable } from '@nestjs/common';
import { CourseService } from 'modules/course/services/course.service';
import { ScheduleTemplateService } from 'modules/schedule-template/services/schedule-template.service';

import { CreateClassDto } from '../dtos';
import { ClassRepository } from '../repositories/class.repository';
import { generateScheduleSessions, normalizeDate, parseWeekdays } from '../utils';

@Injectable()
export class ClassService {
  constructor(
    private readonly classRepo: ClassRepository,
    private readonly courseService: CourseService,
    private readonly scheduleTemplateService: ScheduleTemplateService
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
}
