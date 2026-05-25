import { forwardRef, Module } from '@nestjs/common';
import { CourseModule } from 'modules/course/course.module';
import { EnrollmentModule } from 'modules/enrollment/enrollment.module';
import { ScheduleTemplateModule } from 'modules/schedule-template/schedule-template.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';
import { StudentModule } from 'modules/student/student.module';
import { TeacherModule } from 'modules/teacher/teacher.module';

import { ClassService } from './services/class.service';
import { ClassController } from './controllers/class.controller';
import { ClassRepository } from './repositories/class.repository';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => CourseModule),
    ScheduleTemplateModule,
    EnrollmentModule,
    forwardRef(() => ScheduleSessionModule),
    StudentModule,
    TeacherModule
  ],
  controllers: [ClassController],
  providers: [ClassService, ClassRepository],
  exports: [ClassService]
})
export class ClassModule {}
