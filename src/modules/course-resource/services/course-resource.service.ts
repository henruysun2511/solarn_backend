import { Injectable } from '@nestjs/common';
import { ResourceType } from '@prisma/client';

import { CreateCourseResourceDto } from '../dtos/create-course-resource.dto';
import { CourseResourceRepository } from '../repositories/course-resource.repository';

@Injectable()
export class CourseResourceService {
  constructor(private readonly courseResourceRepo: CourseResourceRepository) {}

  create(dto: CreateCourseResourceDto) {
    return this.courseResourceRepo.create({
      courseId: dto.courseId,
      title: dto.title,
      fileUrl: dto.fileUrl,
      type: dto.type as ResourceType
    });
  }

  findAllByCourseId(courseId: string, type?: ResourceType) {
    return this.courseResourceRepo.findManyByCourseId(courseId, type);
  }

  delete(resourceId: string) {
    return this.courseResourceRepo.delete(resourceId);
  }
}
