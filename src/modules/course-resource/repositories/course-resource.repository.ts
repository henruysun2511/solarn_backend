import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class CourseResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { courseId: string; title: string; fileUrl: string; type: ResourceType }) {
    return this.prisma.courseResource.create({
      data: {
        courseId: data.courseId,
        title: data.title,
        fileUrl: data.fileUrl,
        type: data.type
      },
      select: {
        resourceId: true,
        courseId: true,
        title: true,
        fileUrl: true,
        type: true
      }
    });
  }

  findManyByCourseId(courseId: string, type?: ResourceType) {
    return this.prisma.courseResource.findMany({
      where: {
        courseId,
        ...(type && { type })
      },
      select: {
        resourceId: true,
        courseId: true,
        title: true,
        fileUrl: true,
        type: true
      }
    });
  }

  async delete(resourceId: string) {
    return this.prisma.courseResource.delete({
      where: { resourceId }
    });
  }
}
