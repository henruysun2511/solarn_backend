import { BadRequestException, ConflictException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { paginate } from 'shared/helpers';
import { StudyShiftService } from 'modules/study-shift/services/study-shift.service';
import { ClassService } from 'modules/class/services/class.service';

import { SCHEDULE_SESSION_ERRORS } from '../constants/schedule-session-errors.constant';
import { ScheduleSessionRepository } from '../repositories/schedule-session.repository';
import { ScheduleSessionClassSearchDto } from '../dtos/schedule-session-class-search.dto';
import { ScheduleSessionSearchDto } from '../dtos/schedule-session.search.dto';
import { CreateScheduleSessionDto } from '../dtos';

@Injectable()
export class ScheduleSessionService {
  constructor(
    private readonly scheduleSessionRepo: ScheduleSessionRepository,
    private readonly studyShiftService: StudyShiftService,
    @Inject(forwardRef(() => ClassService))
    private readonly classService: ClassService
  ) {}

  /** Chuẩn hoá về DATE (UTC 00:00) để khớp field `studyDate` kiểu DATE trong DB. */
  private normalizeDate(dateValue: string | Date): Date {
    const date = new Date(dateValue);
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  /**
   * Nghiệp vụ: so sánh "cùng ngày" theo local timezone của server.
   *
   * Lưu ý: `studyDate` là kiểu DATE (không có giờ). Prisma map về JS `Date` (thường ở 00:00Z),
   * nên mình so sánh theo local date component để tránh lệch do timezone.
   */
  private isSameLocalDate(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  /**
   * Nghiệp vụ: chỉ chặn cập nhật trạng thái nếu "chưa tới giờ học".
   *
   * Lý do: có trường hợp giáo viên dạy quá giờ (sau giờ kết thúc trong timeRange) nhưng vẫn cần
   * cập nhật trạng thái buổi học, nên KHÔNG chặn khi đã qua giờ kết thúc.
   *
   * Quy ước:
   * - timeRange dạng "HH:mm - HH:mm" (VD: "18:00 - 20:00").
   * - Nếu không parse được định dạng, hoặc ca qua ngày (end < start), bỏ qua check giờ để tránh khoá nhầm.
   */
  private isNowAfterStartTime(timeRange: string, now: Date): boolean {
    const match = /^\s*(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\s*$/.exec(timeRange);
    if (!match) return true; // không parse được thì bỏ qua check giờ

    const startHour = Number(match[1]);
    const startMinute = Number(match[2]);
    const endHour = Number(match[3]);
    const endMinute = Number(match[4]);

    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const current = now.getHours() * 60 + now.getMinutes();

    if (end < start) return true; // ca qua ngày (không support), bỏ qua
    return current >= start;
  }

  /**
   * Nghiệp vụ: Giáo viên cập nhật trạng thái buổi học.
   *
   * Rule:
   * - Chỉ được cập nhật khi thời gian hiện tại trùng với `studyDate` của buổi học.
   * - Nếu buổi học có ca học (shift.timeRange) thì chỉ chặn nếu "chưa tới giờ bắt đầu".
   *
   * Mục đích: tránh việc cập nhật trạng thái sai ngày/giờ (ví dụ cập nhật sớm hoặc quá trễ).
   */
  async updateStatus(sessionId: string, status: ClassSessionStatus) {
    const session = await this.scheduleSessionRepo.findByIdForStatusUpdate(sessionId);
    if (!session) {
      throw new BadRequestException({
        ...SCHEDULE_SESSION_ERRORS.SESSION_NOT_FOUND,
        sessionId
      });
    }

    const now = new Date();
    if (!this.isSameLocalDate(now, session.studyDate)) {
      throw new BadRequestException({
        ...SCHEDULE_SESSION_ERRORS.SESSION_DATE_MISMATCH,
        sessionId,
        studyDate: session.studyDate
      });
    }

    const timeRange = session.shift?.timeRange;
    if (timeRange && !this.isNowAfterStartTime(timeRange, now)) {
      throw new BadRequestException({
        ...SCHEDULE_SESSION_ERRORS.SESSION_TIME_MISMATCH,
        sessionId,
        timeRange
      });
    }

    return this.scheduleSessionRepo.updateStatus(sessionId, status);
  }

  async getClassProgressStats(classId: string) {
    const [totalSessions, endedSessions] = await Promise.all([
      this.scheduleSessionRepo.countByClassId(classId),
      this.scheduleSessionRepo.countEndedByClassId(classId)
    ]);

    return {
      totalSessions,
      endedSessions
    };
  }

  getClassProgressStatsMap(classIds: string[]) {
    return this.scheduleSessionRepo.countStatsByClassIds(classIds);
  }

  findTeacherSessionConflicts(teacherId: string, sessions: Array<{ shiftCode: string; studyDate: Date }>) {
    return this.scheduleSessionRepo.findTeacherSessionConflicts(teacherId, sessions);
  }

  findByIdWithClassTeacher(sessionId: string) {
    return this.scheduleSessionRepo.findByIdWithClassTeacher(sessionId);
  }

  findSessionConflict(shiftCode: string, studyDate: Date, excludeSessionId?: string) {
    return this.scheduleSessionRepo.findSessionConflict(shiftCode, studyDate, excludeSessionId);
  }

  getSessionMetaMap(sessionIds: string[]) {
    return this.scheduleSessionRepo.getSessionMetaMap(sessionIds);
  }

  getSessionToClassIdMap(sessionIds: string[]) {
    return this.scheduleSessionRepo.getSessionToClassIdMap(sessionIds);
  }

  findEndedSessionsWithinRange(salaryDate: Date, nextMonthDate: Date) {
    return this.scheduleSessionRepo.findEndedSessionsWithinRange(salaryDate, nextMonthDate);
  }

  async findAllByClassId(classId: string, query: ScheduleSessionClassSearchDto) {
    const [data, total] = await Promise.all([
      this.scheduleSessionRepo.findManyByClassId(classId, query),
      this.scheduleSessionRepo.countByClassIdQuery(classId, query)
    ]);
    return paginate(data, total, query);
  }

  async findAll(query: ScheduleSessionSearchDto) {
    const [data, total] = await Promise.all([
      this.scheduleSessionRepo.findMany(query),
      this.scheduleSessionRepo.countQuery(query)
    ]);

    return paginate(data, total, query);
  }

  /**
   * Thêm 1 buổi học cho lớp.
   * Rule:
   * - Không được trùng (classId, shiftCode, studyDate)
   * - Không được trùng lịch giáo viên với lớp khác (cùng ngày+ca)
   * - Không được trùng phòng với lớp khác còn đang học (cùng ngày+ca)
   */
  async createOneForClass(classId: string, dto: CreateScheduleSessionDto) {
    const classInfo = await this.classService.getInfoForSessionCreate(classId);
    if (!classInfo) {
      throw new BadRequestException('Lớp không tồn tại');
    }

    const shift = await this.studyShiftService.findByCode(dto.shiftCode);
    if (!shift) {
      throw new BadRequestException('Ca học không tồn tại');
    }

    const studyDate = this.normalizeDate(dto.studyDate);

    const duplicate = await this.scheduleSessionRepo.findDuplicateInClass(classId, dto.shiftCode, studyDate);
    if (duplicate) {
      throw new ConflictException({
        message: 'Buổi học đã tồn tại trong lớp',
        reason: 'SCHEDULE_SESSION_DUPLICATE',
        classId,
        shiftCode: dto.shiftCode,
        studyDate
      });
    }

    const teacherConflict = await this.scheduleSessionRepo.findTeacherConflict(
      classInfo.teacherId,
      classId,
      dto.shiftCode,
      studyDate
    );
    if (teacherConflict) {
      throw new ConflictException({
        message: 'Giáo viên bị trùng lịch với lớp khác',
        reason: 'TEACHER_SCHEDULE_CONFLICT',
        teacherId: classInfo.teacherId,
        conflict: teacherConflict
      });
    }

    const roomConflicts = await this.classService.findRoomConflictsForSession(classInfo.roomCode, {
      shiftCode: dto.shiftCode,
      studyDate
    });
    const hasRoomConflict = roomConflicts.some((c) => c.classId !== classId);
    if (hasRoomConflict) {
      throw new ConflictException({
        message: 'Phòng đang bị trùng lịch với lớp khác',
        reason: 'CLASS_ROOM_SCHEDULE_CONFLICT',
        roomCode: classInfo.roomCode,
        conflicts: roomConflicts
      });
    }

    return this.scheduleSessionRepo.createOne(classId, dto.shiftCode, studyDate);
  }
}
