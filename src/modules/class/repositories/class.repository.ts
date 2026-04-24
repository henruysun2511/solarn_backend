import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

import { CreateClassDto } from '../dtos';

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClassDto) {
    return this.prisma.class.create({
      data: {
        startDate: new Date(dto.startDate),
        maxStudents: dto.maxStudents,
        course: {
          connect: {
            courseId: dto.courseId
          }
        },
        teacher: {
          connect: {
            teacherId: dto.teacherId
          }
        }
      }
    });
  }
}
