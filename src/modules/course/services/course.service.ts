import { BadRequestException, Injectable } from '@nestjs/common';

import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dtos';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepository) {}

  async create(courseDto: CreateCourseDto) {
    return this.courseRepo.create(courseDto);
  }

  async getTotalSessions(courseId: string) {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new BadRequestException('Khóa học không tồn tại');
    }

    return course.totalSessions;
  }
}
