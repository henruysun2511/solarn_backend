import { Injectable } from '@nestjs/common';

import { StudentRepository } from '../repositories/student.repository';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) {}

  findByAccountId(accountId: string) {
    return this.studentRepo.findByAccountId(accountId);
  }
}
