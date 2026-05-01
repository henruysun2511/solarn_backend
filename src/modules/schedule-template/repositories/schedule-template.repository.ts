import { Injectable } from '@nestjs/common';
import { ClassScheduleTemplate, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { ScheduleTemplateSearchDto, UpdateScheduleTemplateDto } from '../dtos';

@Injectable()
export class ScheduleTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: ScheduleTemplateSearchDto): Prisma.ClassScheduleTemplateWhereInput {
    const { search, shiftCode } = query;

    return {
      ...(search && {
        templateName: { contains: search, mode: 'insensitive' }
      }),
      ...(shiftCode && { shiftCode })
    };
  }

  async findMany(query: ScheduleTemplateSearchDto): Promise<ClassScheduleTemplate[]> {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    return this.prisma.classScheduleTemplate.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        shift: {
          select: {
            shiftName: true,
            timeRange: true
          }
        }
      }
    });
  }

  async count(query: ScheduleTemplateSearchDto): Promise<number> {
    return this.prisma.classScheduleTemplate.count({
      where: this.buildWhere(query)
    });
  }

  async create(data: Prisma.ClassScheduleTemplateUncheckedCreateInput) {
    return this.prisma.classScheduleTemplate.create({
      data: {
        templateName: data.templateName,
        weekdays: data.weekdays,
        shiftCode: data.shiftCode
      }
    });
  }

  async update(templateId: string, data: UpdateScheduleTemplateDto): Promise<ClassScheduleTemplate> {
    return await this.prisma.classScheduleTemplate.update({
      where: { templateId },
      data
    });
  }

  async delete(templateId: string) {
    return await this.prisma.classScheduleTemplate.delete({
      where: { templateId }
    });
  }

  async findShiftByCode(shiftCode: string) {
    return this.prisma.studyShift.findUnique({
      where: { shiftCode },
      select: { shiftCode: true }
    });
  }

  async findActiveById(templateId: string) {
    return this.prisma.classScheduleTemplate.findUnique({
      where: { templateId },
      select: {
        templateId: true,
        weekdays: true,
        shiftCode: true
      }
    });
  }
}
