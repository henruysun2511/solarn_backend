import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { ScheduleTemplateService } from './services/schedule-template.service';
import { ScheduleTemplateController } from './controllers/schedule-template.controller';
import { ScheduleTemplateRepository } from './repositories/schedule-template.repository';

@Module({
  imports: [PrismaModule],
  controllers: [ScheduleTemplateController],
  providers: [ScheduleTemplateService, ScheduleTemplateRepository],
  exports: [ScheduleTemplateService]
})
export class ScheduleTemplateModule {}
