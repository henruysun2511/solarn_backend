import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class StudyShiftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StudyShiftCreateInput) {
    return this.prisma.studyShift.create({
      data
    });
  }
}
