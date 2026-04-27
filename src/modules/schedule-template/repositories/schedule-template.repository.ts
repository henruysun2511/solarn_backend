import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ScheduleTemplateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ClassScheduleTemplateUncheckedCreateInput) {
    return this.prisma.classScheduleTemplate.create({
      data: {
        templateName: data.templateName,
        weekdays: data.weekdays,
        shiftCode: data.shiftCode
      }
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
