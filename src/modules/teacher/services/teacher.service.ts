import { Injectable, NotFoundException } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { UpdateTeacherProfileDto } from '../dtos/update-teacher-profile.dto';
import { TeacherSearchDto } from '../dtos/teacher-search.dto';
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

  async findAll(query: TeacherSearchDto) {
    const [data, total] = await Promise.all([this.teacherRepo.findMany(query), this.teacherRepo.countAllQuery(query)]);

    return paginate(data, total, query);
  }

  async findMyProfile(accountId: string) {
    const teacher = await this.teacherRepo.findTeacherProfileByAccountId(accountId);
    if (!teacher) {
      throw new NotFoundException('Không tìm thấy thông tin giáo viên');
    }
    return teacher;
  }

  async updateMyProfile(accountId: string, dto: UpdateTeacherProfileDto) {
    const teacher = await this.teacherRepo.findTeacherByAccountId(accountId);
    if (!teacher) {
      throw new NotFoundException('Không tìm thấy thông tin giáo viên');
    }

    const updateData: any = {};
    if (dto.fullName !== undefined) updateData.fullName = dto.fullName;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.dob !== undefined) updateData.dob = new Date(dto.dob);
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    if (Object.keys(updateData).length > 0) {
      await this.teacherRepo.updateProfile(accountId, updateData);
    }

    return this.teacherRepo.findTeacherProfileByAccountId(accountId);
  }
}
