import { Injectable } from '@nestjs/common';

import { StudyShiftRepository } from '../repositories/study-shift.repository';
import { CreateStudyShiftDto } from '../dtos';

@Injectable()
export class StudyShiftService {
  constructor(private readonly studyShiftRepo: StudyShiftRepository) {}

  async create(studyShiftDto: CreateStudyShiftDto) {
    return this.studyShiftRepo.create(studyShiftDto);
  }
}
