import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { StudentModule } from 'modules/student/student.module';
import { EnrollmentModule } from 'modules/enrollment/enrollment.module';
import { ClassModule } from 'modules/class/class.module';
import { TeacherModule } from 'modules/teacher/teacher.module';
import { SalaryModule } from 'modules/salary/salary.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';

import { RequestService } from './services/request.service';
import { RequestController } from './controllers/request.controller';
import { RequestRepository } from './repositories/request.repository';

@Module({
  imports: [
    PrismaModule,
    StudentModule,
    EnrollmentModule,
    ClassModule,
    TeacherModule,
    SalaryModule,
    ScheduleSessionModule
  ],
  controllers: [RequestController],
  providers: [RequestService, RequestRepository]
})
export class RequestModule {}
