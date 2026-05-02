import { Injectable, BadRequestException } from '@nestjs/common';
import { StudentService } from 'modules/student/services/student.service';

import { FeedbackRepository } from '../repositories/feedback.repository';
import { CreateFeedbackDto } from '../dtos/create-feedback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly studentService: StudentService
  ) {}

  async create(accountId: string, dto: CreateFeedbackDto) {
    const student = await this.studentService.findByAccountId(accountId);
    if (!student) throw new BadRequestException('Sinh viên không tồn tại');

    return this.feedbackRepo.create({
      studentId: student.studentId,
      classId: dto.classId,
      teacherId: dto.teacherId,
      content: dto.content
    });
  }
}
