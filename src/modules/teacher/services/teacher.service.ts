import { Injectable } from '@nestjs/common';

import { TeacherRepository } from '../repositories/teacher.repository';

@Injectable()
export class TeacherService {
  constructor(private readonly teacherRepo: TeacherRepository) {}

  async findTeacherIdByAccountId(accountId: string) {
    return this.teacherRepo.findTeacherIdByAccountId(accountId);
  }

  async findTeachersForSalary() {
    return this.teacherRepo.findTeachersForSalary();
  }

  async findTeacherByAccountId(accountId: string) {
    return this.teacherRepo.findTeacherByAccountId(accountId);
  }
}
