import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { TeacherModule } from 'modules/teacher/teacher.module';

import { AssignmentResultService } from './services/assignment-result.service';
import { AssignmentResultController } from './controllers/assignment-result.controller';
import { AssignmentResultRepository } from './repositories/assignment-result.repository';

@Module({
  imports: [PrismaModule, TeacherModule],
  controllers: [AssignmentResultController],
  providers: [AssignmentResultService, AssignmentResultRepository]
})
export class AssignmentResultModule {}
