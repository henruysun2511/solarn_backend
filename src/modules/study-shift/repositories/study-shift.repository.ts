import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma, StudyShift } from '@prisma/client';

import { StudyShiftSearchDto, UpdateStudyShiftDto } from '../dtos';

@Injectable()
export class StudyShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: StudyShiftSearchDto): Prisma.StudyShiftWhereInput {
    const { search, timeRange } = query;

    return {
      ...(search && {
        OR: [
          { shiftCode: { contains: search, mode: 'insensitive' } },
          { shiftName: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(timeRange && { timeRange: { contains: timeRange, mode: 'insensitive' } })
    };
  }

  async findMany(query: StudyShiftSearchDto): Promise<StudyShift[]> {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    return this.prisma.studyShift.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    });
  }

  async count(query: StudyShiftSearchDto): Promise<number> {
    return this.prisma.studyShift.count({
      where: this.buildWhere(query)
    });
  }

  async create(data: Prisma.StudyShiftCreateInput) {
    return this.prisma.studyShift.create({
      data
    });
  }

  async update(shiftId: string, data: UpdateStudyShiftDto): Promise<StudyShift> {
    return await this.prisma.studyShift.update({
      where: { shiftId },
      data
    });
  }

  async delete(shiftId: string) {
    return await this.prisma.studyShift.delete({
      where: { shiftId }
    });
  }
}
