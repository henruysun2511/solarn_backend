import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { TeacherController } from './controllers/teacher.controller';
import { TeacherRepository } from './repositories/teacher.repository';
import { TeacherService } from './services/teacher.service';

@Module({
  imports: [PrismaModule],
  controllers: [TeacherController],
  providers: [TeacherService, TeacherRepository],
  exports: [TeacherService]
})
export class TeacherModule {}
