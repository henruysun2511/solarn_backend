import { Injectable } from '@nestjs/common';
import { Course, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { CourseSearchDto } from '../dtos/course-search.dto';

@Injectable()
export class CourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: CourseSearchDto): Prisma.CourseWhereInput {
    const { search, level, courseName } = query;
    return {
      ...(search && {
        courseName: { contains: search, mode: 'insensitive' }
      }),
      ...(courseName && {
        courseName: { contains: courseName, mode: 'insensitive' }
      }),
      ...(level && { level })
    };
  }

  async findMany(query: CourseSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    return this.prisma.course.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        _count: {
          select: { classes: true }
        }
      }
    });
  }

  async count(query: CourseSearchDto): Promise<number> {
    const where = this.buildWhere(query);
    return this.prisma.course.count({ where });
  }

  async create(data: Prisma.CourseCreateInput): Promise<Course> {
    return this.prisma.course.create({ data });
  }

  async findById(courseId: string) {
    return this.prisma.course.findUnique({
      where: { courseId },
      include: {
        _count: {
          select: { classes: true }
        }
      }
    });
  }

  async update(courseId: string, data: Prisma.CourseUpdateInput): Promise<Course> {
    return this.prisma.course.update({
      where: { courseId },
      data
    });
  }

  async delete(courseId: string): Promise<Course> {
    return this.prisma.course.delete({
      where: { courseId }
    });
  }

  async hasClasses(courseId: string): Promise<boolean> {
    const count = await this.prisma.class.count({
      where: { courseId }
    });
    return count > 0;
  }
}
