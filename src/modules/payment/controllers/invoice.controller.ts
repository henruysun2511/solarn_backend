import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Public, User } from 'common/decorators';
import { IAccountRequest } from 'common/interfaces';
import { ApiBearerAuth } from '@nestjs/swagger';

import { PaymentWebhookGuard } from '../guard/invoice.guard';
import { InvoiceDto, IPayosWebhookBodyPayload } from '../dtos';
import { InvoiceService } from '../services/invoice.service';

@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(private readonly paymentService: InvoiceService) {}

  @Post('')
  createInvoice(@Body() dto: InvoiceDto, @User() user: IAccountRequest) {
    return this.paymentService.createInvoice(dto, user.accountId);
  }

  @Public()
  @Post('webhook')
  @UseGuards(PaymentWebhookGuard)
  handleWebhook(@Body() body: IPayosWebhookBodyPayload) {
    return this.paymentService.handleWebhook(body);
  }
}
