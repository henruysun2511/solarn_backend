import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { CourseResourceService } from './services/course-resource.service';
import { CourseResourceController } from './controllers/course-resource.controller';
import { CourseResourceRepository } from './repositories/course-resource.repository';

@Module({
  imports: [PrismaModule],
  controllers: [CourseResourceController],
  providers: [CourseResourceService, CourseResourceRepository],
  exports: [CourseResourceService]
})
export class CourseResourceModule {}
