import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { TeacherModule } from 'modules/teacher/teacher.module';

import { DashboardController } from './controllers/dashboard.controller';
import { DashboardService } from './services/dashboard.service';

@Module({
  imports: [PrismaModule, TeacherModule],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}
