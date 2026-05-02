import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { StudentService } from './services/student.service';
import { StudentController } from './controllers/student.controller';
import { StudentRepository } from './repositories/student.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StudentController],
  providers: [StudentService, StudentRepository],
  exports: [StudentService]
})
export class StudentModule {}
