import { BadRequestException, Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { StudentRepository } from '../repositories/student.repository';
import { StudentClassSearchDto } from '../dtos/student-class-search.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) {}

  findByAccountId(accountId: string) {
    return this.studentRepo.findByAccountId(accountId);
  }

  async getStudentIdByAccountIdOrThrow(accountId: string): Promise<string> {
    const student = await this.studentRepo.findByAccountId(accountId);
    if (!student) {
      throw new BadRequestException('Học sinh không tồn tại');
    }

    return student.studentId;
  }

  async findAllByClassId(classId: string, query: StudentClassSearchDto) {
    const [data, total] = await Promise.all([
      this.studentRepo.findManyByClassId(classId, query),
      this.studentRepo.countByClassIdQuery(classId, query)
    ]);
    return paginate(data, total, query);
  }
}
