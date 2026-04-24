import { Injectable } from '@nestjs/common';

import { CourseRepository } from '../repositories/course.repository';
import { CreateCourseDto } from '../dtos';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepository) {}

  async create(courseDto: CreateCourseDto) {
    return this.courseRepo.create(courseDto);
  }
}
