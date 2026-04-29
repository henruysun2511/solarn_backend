import { Module } from '@nestjs/common';
import { ClassModule } from 'modules/class/class.module';
import { EnrollmentModule } from 'modules/enrollment/enrollment.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';

import { AttendanceService } from './services/attendance.service';
import { AttendanceController } from './controllers/attendance.controller';
import { AttendanceRepository } from './repositories/attendance.repository';

@Module({
  imports: [PrismaModule, ClassModule, EnrollmentModule, ScheduleSessionModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, AttendanceRepository]
})
export class AttendanceModule {}
