import { Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { CreateStudyShiftDto, StudyShiftSearchDto, UpdateStudyShiftDto } from '../dtos';
import { StudyShiftRepository } from '../repositories/study-shift.repository';

@Injectable()
export class StudyShiftService {
  constructor(private readonly studyShiftRepo: StudyShiftRepository) {}

  findByCode(shiftCode: string) {
    return this.studyShiftRepo.findByCode(shiftCode);
  }

  async create(studyShiftDto: CreateStudyShiftDto) {
    return this.studyShiftRepo.create(studyShiftDto);
  }

  async findAll(query: StudyShiftSearchDto) {
    const [data, total] = await Promise.all([this.studyShiftRepo.findMany(query), this.studyShiftRepo.count(query)]);
    return paginate(data, total, query);
  }

  async update(shiftId: string, dto: UpdateStudyShiftDto) {
    return await this.studyShiftRepo.update(shiftId, dto);
  }

  async delete(shiftId: string) {
    return await this.studyShiftRepo.delete(shiftId);
  }
}
