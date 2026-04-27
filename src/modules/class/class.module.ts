import { Module } from '@nestjs/common';
import { CourseModule } from 'modules/course/course.module';
import { ScheduleTemplateModule } from 'modules/schedule-template/schedule-template.module';
import { PrismaModule } from 'prisma/prisma.module';

import { ClassService } from './services/class.service';
import { ClassController } from './controllers/class.controller';
import { ClassRepository } from './repositories/class.repository';

@Module({
  imports: [PrismaModule, CourseModule, ScheduleTemplateModule],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository]
})
export class ClassModule {}
