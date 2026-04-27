import { Module } from '@nestjs/common';

import { StudyShiftService } from './services/study-shift.service';
import { StudyShiftController } from './controllers/study-shift.controller';
import { StudyShiftRepository } from './repositories/study-shift.repository';

@Module({
  controllers: [StudyShiftController],
  providers: [StudyShiftService, StudyShiftRepository]
})
export class StudyShiftModule {}
