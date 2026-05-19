import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AssignmentResultModule } from 'modules/assignment-result/assignment-result.module';
import { AttendanceModule } from 'modules/attendance/attendance.module';
import { BranchModule } from 'modules/branch/branch.module';
import { ClassModule } from 'modules/class/class.module';
import { CloudinaryModule } from 'modules/cloudinary/cloudinary.module';
import { CourseModule } from 'modules/course/course.module';
import { FeedbackModule } from 'modules/feedback/feedback.module';
import { InvoiceModule } from 'modules/payment/invoice.module';
import { RequestModule } from 'modules/request/request.module';
import { RoleModule } from 'modules/role/role.module';
import { RoomModule } from 'modules/room/room.module';
import { SalaryModule } from 'modules/salary/salary.module';
import { ScheduleTemplateModule } from 'modules/schedule-template/schedule-template.module';
import { StudyShiftModule } from 'modules/study-shift/study-shift.module';
import { SharedModule } from 'shared/shared.module';
import { CourseResourceModule } from 'modules/course-resource/course-resource.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    BranchModule,
    ConfigModule.forRoot({
      isGlobal: true
    }),
    CourseModule,
    ClassModule,
    CloudinaryModule,
    FeedbackModule,
    PrismaModule,
    AccountModule,
    AssignmentResultModule,
    AuthModule,
    RoleModule,
    RoomModule,
    StudyShiftModule,
    AttendanceModule,
    AssignmentResultModule,
    RequestModule,
    SalaryModule,
    ScheduleTemplateModule,
    InvoiceModule,
    SharedModule,
    CourseResourceModule
  ],

  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
