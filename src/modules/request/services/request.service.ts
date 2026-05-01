import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { TeacherService } from 'modules/teacher/services/teacher.service';
import { SalaryService } from 'modules/salary/services/salary.service';

import { RequestRepository } from '../repositories/request.repository';
import { CreateSalaryComplaintDto } from '../dtos';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestRepo: RequestRepository,
    private readonly teacherService: TeacherService,
    private readonly salaryService: SalaryService
  ) {}

  /**
   * Tạo request khiếu nại lương
   *
   * Business logic:
   * - Lấy `teacherId` từ token (accountId -> profile.accountId -> teacher)
   * - Kiểm tra `salary` có tồn tại không
   * - Kiểm tra `salary.teacherId` khớp với `teacherId` từ token (đảm bảo giáo viên chỉ khiếu nại lương của chính mình)
   * - Nếu xác minh thành công, tạo request với status = PENDING
   *
   * @throws BadRequestException nếu salary không tồn tại
   * @throws ConflictException nếu salary.teacherId không khớp với teacher hiện tại
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
}
