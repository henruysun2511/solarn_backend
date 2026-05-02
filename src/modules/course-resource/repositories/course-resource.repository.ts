import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { ResourceType } from '@prisma/client';

@Injectable()
export class CourseResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { title: string; fileUrl: string; type: ResourceType }) {
    return this.prisma.courseResource.create({
      data: {
        title: data.title,
        fileUrl: data.fileUrl,
        type: data.type
      },
      select: {
        resourceId: true,
        title: true,
        fileUrl: true,
        type: true
      }
    });
  }
}
