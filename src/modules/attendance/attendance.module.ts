import { Module } from '@nestjs/common';
import { EnrollmentModule } from 'modules/enrollment/enrollment.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';
import { StudentModule } from 'modules/student/student.module';

import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';

@Module({
  imports: [PrismaModule, EnrollmentModule, ScheduleSessionModule, StudentModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository],
  exports: [AttendanceService]
})
export class AttendanceModule {}
