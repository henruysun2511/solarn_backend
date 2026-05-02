import { Injectable } from '@nestjs/common';
import { ResourceType } from '@prisma/client';

import { CourseResourceRepository } from '../repositories/course-resource.repository';
import { CreateCourseResourceDto } from '../dtos/create-course-resource.dto';

@Injectable()
export class CourseResourceService {
  constructor(private readonly courseResourceRepo: CourseResourceRepository) {}

  create(dto: CreateCourseResourceDto) {
    return this.courseResourceRepo.create({
      title: dto.title,
      fileUrl: dto.fileUrl,
      type: dto.type as ResourceType
    });
  }
}
