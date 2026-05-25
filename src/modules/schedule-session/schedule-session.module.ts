import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { StudyShiftModule } from 'modules/study-shift/study-shift.module';
import { ClassModule } from 'modules/class/class.module';

import { ScheduleSessionService } from './services/schedule-session.service';
import { ScheduleSessionController } from './controllers/schedule-session.controller';
import { ScheduleSessionRepository } from './repositories/schedule-session.repository';

@Module({
  imports: [PrismaModule, StudyShiftModule, forwardRef(() => ClassModule)],
  controllers: [ScheduleSessionController],
  providers: [ScheduleSessionService, ScheduleSessionRepository],
  exports: [ScheduleSessionService]
})
export class ScheduleSessionModule {}
