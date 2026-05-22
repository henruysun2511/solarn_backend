import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Public, ResponseMessage, User } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { IAccountRequest } from 'common/interfaces';
import { SwaggerDoc } from 'common/swagger';

import { PaymentWebhookGuard } from '../guard/invoice.guard';
import { InvoiceDto, InvoiceSearchDto, IPayosWebhookBodyPayload } from '../dtos';
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

  @SwaggerDoc({
    summary: 'Lấy danh sách hóa đơn của tôi (học sinh)',
    description: 'Returns paginated invoices for the authenticated student.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by course name' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'PAID', 'CANCELLED'] })
  @ApiQuery({ name: 'classId', required: false, type: String, description: 'Filter by class ID' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: SortOrder })
  @Get('my')
  @ResponseMessage('Lấy danh sách hóa đơn thành công')
  async findMyInvoices(@User() user: IAccountRequest, @Query() query: InvoiceSearchDto) {
    return this.paymentService.findMyInvoices(user, query);
  }
}
