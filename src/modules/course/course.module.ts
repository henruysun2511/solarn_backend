import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { CourseService } from './services/course.service';
import { CourseController } from './controllers/course.controller';
import { CourseRepository } from './repositories/course.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService]
})
export class CourseModule {}
