import { Injectable, BadRequestException } from '@nestjs/common';
import { IAccountRequest } from 'common/interfaces';
import { StudentService } from 'modules/student/services/student.service';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { paginate } from 'shared/helpers';

import { FeedbackRepository } from '../repositories/feedback.repository';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';
import { FeedbackClassSearchDto } from '../dtos/feedback-class-search.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly studentService: StudentService,
    private readonly teacherService: TeacherService
  ) {}

  async create(accountId: string, dto: CreateFeedbackDto) {
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) throw new BadRequestException('Sinh viên không tồn tại');

    return this.feedbackRepo.create({
      studentId: student.studentId,
      classId: dto.classId,
      teacherId: dto.teacherId,
      content: dto.content,
      starRating: dto.starRating
    });
  }

  async findAllByClassId(classId: string, query: FeedbackClassSearchDto) {
    const [data, total] = await Promise.all([
      this.feedbackRepo.findManyByClassId(classId, query),
      this.feedbackRepo.countByClassIdQuery(classId, query)
    ]);
    return paginate(data, total, query);
  }

  async findMyFeedbacks(user: IAccountRequest, query: FeedbackClassSearchDto) {
    const teacher = await this.teacherService.findTeacherByAccountId(user.accountId);
    if (!teacher) {
      throw new BadRequestException('Giáo viên không tồn tại');
    }

    const [data, total] = await Promise.all([
      this.feedbackRepo.findManyByTeacherId(teacher.teacherId, query),
      this.feedbackRepo.countByTeacherId(teacher.teacherId, query)
    ]);
    return paginate(data, total, query);
  }
}
