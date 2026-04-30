import { Module } from '@nestjs/common';
import { TeacherModule } from 'modules/teacher/teacher.module';
import { ScheduleSessionModule } from 'modules/schedule-session/schedule-session.module';

import { SalaryService } from './services/salary.service';
import { SalaryController } from './controllers/salary.controller';
import { SalaryRepository } from './repositories/salary.repository';

@Module({
  imports: [TeacherModule, ScheduleSessionModule],
  controllers: [SalaryController],
  providers: [SalaryService, SalaryRepository]
})
export class SalaryModule {}
