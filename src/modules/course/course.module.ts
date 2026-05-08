import { Module } from '@nestjs/common';
import { AttendanceModule } from 'modules/attendance/attendance.module';
import { EnrollmentModule } from 'modules/enrollment/enrollment.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';
import { PrismaModule } from 'prisma/prisma.module';

import { CourseService } from './services/course.service';
import { CourseProgressService } from './services/course-progress.service';
import { CourseController } from './controllers/course.controller';
import { CourseRepository } from './repositories/course.repository';

@Module({
  imports: [PrismaModule, AttendanceModule, EnrollmentModule, ScheduleSessionModule],
  controllers: [CourseController],
  providers: [CourseService, CourseProgressService, CourseRepository],
  exports: [CourseService]
})
export class CourseModule {}
