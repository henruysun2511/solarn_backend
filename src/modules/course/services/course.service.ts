import { BadRequestException, Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { CourseSearchDto, CreateCourseDto, UpdateCourseDto } from '../dtos';
import { CourseRepository } from '../repositories/course.repository';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepo: CourseRepository) {}

  async findAll(query: CourseSearchDto) {
    const [courses, total] = await Promise.all([this.courseRepo.findMany(query), this.courseRepo.count(query)]);

    const data = courses.map((course) => {
      const { _count, ...rest } = course;
      return {
        ...rest,
        totalClasses: _count.classes
      };
    });

    return paginate(data, total, query);
  }

  async create(courseDto: CreateCourseDto) {
    return await this.courseRepo.create(courseDto);
  }

  async update(courseId: string, dto: UpdateCourseDto) {
    const hasClasses = await this.courseRepo.hasClasses(courseId);
    if (hasClasses) {
      if (dto.totalSessions !== undefined || dto.tuitionFee !== undefined) {
        throw new BadRequestException('Không thể sửa số buổi học hoặc học phí của khóa học đã có lớp học');
      }
    }
    return await this.courseRepo.update(courseId, dto);
  }

  async delete(courseId: string) {
    const hasClasses = await this.courseRepo.hasClasses(courseId);
    if (hasClasses) {
      throw new BadRequestException('Không thể xóa khóa học đã có lớp học');
    }
    return await this.courseRepo.delete(courseId);
  }

  async getTotalSessions(courseId: string) {
    const course = await this.courseRepo.findById(courseId);

    if (!course) {
      throw new BadRequestException('Khóa học không tồn tại');
    }

    return course.totalSessions;
  }

  async findOne(courseId: string) {
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new BadRequestException('Khóa học không tồn tại');
    }
    const { _count, ...rest } = course;
    return {
      ...rest,
      totalClasses: _count.classes
    };
  }
}
