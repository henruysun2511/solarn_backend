import { BadRequestException, Injectable } from '@nestjs/common';
import { parseWeekdays } from 'modules/class/utils/schedule-generator';

import { CreateScheduleTemplateDto } from '../dtos';
import { ScheduleTemplateRepository } from '../repositories/schedule-template.repository';

@Injectable()
export class ScheduleTemplateService {
  constructor(private readonly templateRepo: ScheduleTemplateRepository) {}

  async create(dto: CreateScheduleTemplateDto) {
    parseWeekdays(dto.weekdays);

    const shift = await this.templateRepo.findShiftByCode(dto.shiftCode);

    if (!shift) {
      throw new BadRequestException('Ca học không tồn tại');
    }

    return this.templateRepo.create(dto);
  }

  async getActiveById(templateId: string) {
    const template = await this.templateRepo.findActiveById(templateId);

    if (!template) {
      throw new BadRequestException('Lịch mẫu không tồn tại hoặc đã bị khóa');
    }

    const shift = await this.templateRepo.findShiftByCode(template.shiftCode);

    if (!shift) {
      throw new BadRequestException('Ca học của lịch mẫu không tồn tại');
    }

    return template;
  }
}
