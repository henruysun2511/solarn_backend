import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { IAccountRequest } from 'common/interfaces';
import { StudentService } from 'modules/student/services/student.service';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { paginate } from 'shared/helpers';

import { AssignmentResultRepository } from '../repositories/assignment-result.repository';
import { MyAssignmentResultSearchDto, UpsertAssignmentResultDto } from '../dtos';

@Injectable()
export class AssignmentResultService {
  constructor(
    private readonly assignmentResultRepo: AssignmentResultRepository,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService
  ) {}

  async upsertMany(items: UpsertAssignmentResultDto[], gradedByAccountId: string) {
    const teacher = await this.teacherService.findTeacherIdByAccountId(gradedByAccountId);
    if (!teacher) {
      throw new ForbiddenException('Chỉ giáo viên mới được nhập điểm');
    }

    return this.assignmentResultRepo.upsertMany(items, teacher.teacherId);
  }

  async findMyTeacherResults(user: IAccountRequest, query: MyAssignmentResultSearchDto) {
    const teacher = await this.teacherService.findTeacherByAccountId(user.accountId);
    if (!teacher) {
      throw new BadRequestException('Giáo viên không tồn tại');
    }

    const [data, total] = await Promise.all([
      this.assignmentResultRepo.findManyByTeacherId(teacher.teacherId, query),
      this.assignmentResultRepo.countByTeacherId(teacher.teacherId, query)
    ]);
    return paginate(data, total, query);
  }

  async findMyStudentResults(user: IAccountRequest, query: MyAssignmentResultSearchDto) {
    const student = await this.studentService.findByAccountId(user.accountId);
    if (!student) {
      throw new BadRequestException('Học sinh không tồn tại');
    }

    const [data, total] = await Promise.all([
      this.assignmentResultRepo.findManyByStudentId(student.studentId, query),
      this.assignmentResultRepo.countByStudentId(student.studentId, query)
    ]);
    return paginate(data, total, query);
  }
}
