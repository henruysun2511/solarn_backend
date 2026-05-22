import { Injectable } from '@nestjs/common';
import { EnrollmentStatus } from '@prisma/client';
import { paginate } from 'shared/helpers';

import { EnrollmentRepository } from '../repositories/enrollment.repository';
import { EnrollmentSearchDto } from '../dtos';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentRepo: EnrollmentRepository) {}

  findByStudentAndClass(studentId: string, classId: string) {
    return this.enrollmentRepo.findByStudentAndClass(studentId, classId);
  }

  findByIdWithStudentAndClass(enrollmentId: string) {
    return this.enrollmentRepo.findByIdWithStudentAndClass(enrollmentId);
  }

  countActiveByClassId(classId: string) {
    return this.enrollmentRepo.countActiveByClassId(classId);
  }

  create(studentId: string, classId: string, status: EnrollmentStatus) {
    return this.enrollmentRepo.create(studentId, classId, status);
  }

  async getEnrolledPairs(studentIds: string[], classIds: string[]): Promise<Set<string>> {
    if (studentIds.length === 0 || classIds.length === 0) return new Set();

    const pairs = await this.enrollmentRepo.findStudentClassPairs(studentIds, classIds);
    return new Set(pairs.map((p) => `${p.studentId}:${p.classId}`));
  }

  findActiveEnrollmentsByCourseId(courseId: string) {
    return this.enrollmentRepo.findActiveEnrollmentsByCourseId(courseId);
  }

  findActiveEnrollmentsByStudentId(studentId: string) {
    return this.enrollmentRepo.findActiveEnrollmentsByStudentId(studentId);
  }

  findActiveEnrollmentsByClassIds(classIds: string[]) {
    return this.enrollmentRepo.findActiveEnrollmentsByClassIds(classIds);
  }

  async findAll(query: EnrollmentSearchDto) {
    const [data, total] = await Promise.all([this.enrollmentRepo.findMany(query), this.enrollmentRepo.count(query)]);
    return paginate(data, total, query);
  }
}
