import { Module } from '@nestjs/common';

import { CourseService } from './services/course.service';
import { CourseController } from './controllers/course.controller';
import { CourseRepository } from './repositories/course.repository';

@Module({
  controllers: [CourseController],
  providers: [CourseService, CourseRepository]
})
export class CourseModule {}
