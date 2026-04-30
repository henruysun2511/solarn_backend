import { Module } from '@nestjs/common';

import { TeacherService } from './services/teacher.service';
import { TeacherController } from './controllers/teacher.controller';
import { TeacherRepository } from './repositories/teacher.repository';

@Module({
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherService]
})
export class TeacherModule {}
