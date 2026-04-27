import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({ data });
  }

  async findById(courseId: string) {
    return this.prisma.course.findUnique({
      where: { courseId },
      select: {
        courseId: true,
        totalSessions: true
      }
    });
  }
}
