import { BadRequestException, Injectable } from '@nestjs/common';

import { StudentRepository } from '../repositories/student.repository';

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
}
