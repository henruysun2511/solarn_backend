import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { ScheduleSessionService } from './services/schedule-session.service';
import { ScheduleSessionController } from './controllers/schedule-session.controller';
import { ScheduleSessionRepository } from './repositories/schedule-session.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduleSessionController],
  providers: [ScheduleSessionService, ScheduleSessionRepository],
  exports: [ScheduleSessionService]
})
export class ScheduleSessionModule {}
