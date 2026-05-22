import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { EnrollmentController } from './controllers/enrollment.controller';
import { EnrollmentRepository } from './repositories/enrollment.repository';
import { EnrollmentService } from './services/enrollment.service';

@Module({
  imports: [PrismaModule],
  controllers: [EnrollmentController],
  providers: [EnrollmentRepository, EnrollmentService],
  exports: [EnrollmentService]
})
export class EnrollmentModule {}
