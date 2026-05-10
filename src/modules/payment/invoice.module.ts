import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClassModule } from 'modules/class/class.module';
import { StudentModule } from 'modules/student/student.module';

import { InvoiceController } from './controllers/invoice.controller';
import { PaymentWebhookGuard } from './guard/invoice.guard';
import { InvoiceService } from './services/invoice.service';
import { InvoiceRepository } from './repositories/invoice.repository';

@Module({
  imports: [HttpModule, ClassModule, StudentModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, PaymentWebhookGuard, InvoiceRepository]
})
export class InvoiceModule {}
