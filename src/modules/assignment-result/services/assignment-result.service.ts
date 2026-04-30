import { ForbiddenException, Injectable } from '@nestjs/common';
import { TeacherService } from 'modules/teacher/services/teacher.service';

import { AssignmentResultRepository } from '../repositories/assignment-result.repository';
import { UpsertAssignmentResultDto } from '../dtos';

@Injectable()
export class AssignmentResultService {
  constructor(
    private readonly assignmentResultRepo: AssignmentResultRepository,
    private readonly teacherService: TeacherService
  ) {}

  async upsertMany(items: UpsertAssignmentResultDto[], gradedByAccountId: string) {
    const teacher = await this.teacherService.findTeacherIdByAccountId(gradedByAccountId);
    if (!teacher) {
      throw new ForbiddenException('Chỉ giáo viên mới được nhập điểm');
    }

    return this.assignmentResultRepo.upsertMany(items, teacher.teacherId);
  }
}
