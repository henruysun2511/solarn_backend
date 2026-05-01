import { BadRequestException, Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';
import { parseWeekdays } from 'modules/class/utils/schedule-generator';

import { CreateScheduleTemplateDto, ScheduleTemplateSearchDto, UpdateScheduleTemplateDto } from '../dtos';
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

  async findAll(query: ScheduleTemplateSearchDto) {
    const [data, total] = await Promise.all([this.templateRepo.findMany(query), this.templateRepo.count(query)]);
    return paginate(data, total, query);
  }

  async update(templateId: string, dto: UpdateScheduleTemplateDto) {
    if (dto.weekdays) {
      parseWeekdays(dto.weekdays);
    }

    if (dto.shiftCode) {
      const shift = await this.templateRepo.findShiftByCode(dto.shiftCode);
      if (!shift) {
        throw new BadRequestException('Ca học không tồn tại');
      }
    }

    return await this.templateRepo.update(templateId, dto);
  }

  async delete(templateId: string) {
    return await this.templateRepo.delete(templateId);
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
