import { Module } from '@nestjs/common';
import { TeacherModule } from 'modules/teacher/teacher.module';
import { SalaryModule } from 'modules/salary/salary.module';

import { RequestService } from './services/request.service';
import { RequestController } from './controllers/request.controller';
import { RequestRepository } from './repositories/request.repository';

@Module({
  controllers: [RequestController, TeacherModule, SalaryModule],
  providers: [RequestService, RequestRepository]
})
export class RequestModule {}
