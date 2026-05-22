import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { StudentRepository } from '../repositories/student.repository';
import { StudentClassSearchDto } from '../dtos/student-class-search.dto';
import { StudentSearchDto } from '../dtos/student-search.dto';
import { UpdateStudentProfileDto } from '../dtos/update-student-profile.dto';

@Injectable()
export class StudentService {
  constructor(private readonly studentRepo: StudentRepository) {}

  findByAccountId(accountId: string) {
    return this.studentRepo.findByAccountId(accountId);
  }

  async findMyProfile(accountId: string) {
    const student = await this.studentRepo.findStudentProfileByAccountId(accountId);
    if (!student) {
      throw new NotFoundException('Không tìm thấy thông tin học sinh');
    }
    return student;
  }

  async updateMyProfile(accountId: string, dto: UpdateStudentProfileDto) {
    const student = await this.studentRepo.findByAccountId(accountId);
    if (!student) {
      throw new NotFoundException('Không tìm thấy thông tin học sinh');
    }

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.dob !== undefined) updateData.dob = new Date(dto.dob);
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    if (Object.keys(updateData).length > 0) {
      await this.studentRepo.updateProfile(accountId, updateData);
    }

    return this.studentRepo.findStudentProfileByAccountId(accountId);
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

  async findAll(query: StudentSearchDto) {
    const [data, total] = await Promise.all([this.studentRepo.findMany(query), this.studentRepo.countAllQuery(query)]);

    return paginate(data, total, query);
  }
}
