import { firstValueFrom } from 'rxjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { ClassService } from 'modules/class/services/class.service';
import { StudentService } from 'modules/student/services/student.service';
import { AppConfig } from 'common/constants';
import { generateSignature } from 'common/utils';
import { CustomLogger } from 'shared/logger/logger.service';
import { InvoiceStatus } from '@prisma/client';

import { IPayosRequestPaymentPayload, IPayosWebhookBodyPayload, InvoiceDto } from '../dtos';
import { InvoiceRepository } from '../repositories/invoice.repository';

@Injectable()
export class InvoiceService {
  private readonly baseUrl = 'https://api-merchant.payos.vn/v2';
  private readonly createPaymentUrl = `${this.baseUrl}/payment-requests`;

  constructor(
    private readonly invoiceRepo: InvoiceRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly classService: ClassService,
    private readonly studentService: StudentService,
    private readonly logger: CustomLogger
  ) {}
  async getResponsePaymentData(url: string, payload: IPayosRequestPaymentPayload) {
    const response = await firstValueFrom(
      this.httpService.post(url, payload, {
        headers: {
          'x-client-id': this.configService.getOrThrow<string>('PAYOS_CLIENT_ID'),
          'x-api-key': this.configService.getOrThrow<string>('PAYOS_API_KEY')
        }
      })
    );

    return response.data.data;
  }

  /**
   * Bước xử lý:
   * 1) Kiểm tra lớp có tồn tại hay không
   * 2) Lấy giá tiền của lớp (từ Course.tuitionFee)
   * 3) Sinh orderCode ngẫu nhiên (< 10^8)
   */
  async createInvoice(dto: InvoiceDto, accountId: string) {
    const studentId = await this.studentService.getStudentIdByAccountIdOrThrow(accountId);

    const tuitionFee = await this.classService.getTuitionFeeByClassIdOrThrow(dto.classId);
    const amount = tuitionFee.toNumber();

    const orderCode = this.generateOrderCodeUnder1e8();

    const dataForSignature = {
      orderCode,
      amount,
      description: ``,
      cancelUrl: AppConfig.INVOICE.CANCEL_URL,
      returnUrl: AppConfig.INVOICE.RETURN_URL
    };

    const signature = generateSignature(dataForSignature, this.configService.getOrThrow<string>('PAYOS_CHECKSUM_KEY'));

    const payload: IPayosRequestPaymentPayload = {
      ...dataForSignature,
      signature
    };

    const responseData = await this.getResponsePaymentData(this.createPaymentUrl, payload);

    const transactionId = String(responseData.orderCode);

    await this.invoiceRepo.create({
      data: {
        transactionId,
        studentId,
        amount,
        classId: dto.classId
      }
    });

    return responseData;
  }

  private generateOrderCodeUnder1e8(): number {
    // Tạo mã 8 chữ số: [10_000_000 .. 99_999_999] (luôn < 10^8)
    return Math.floor(10_000_000 + Math.random() * 90_000_000);
  }

  async handleWebhook(webhookData: IPayosWebhookBodyPayload) {
    const orderCode = webhookData?.data?.orderCode;

    try {
      if (!orderCode) {
        throw new BadRequestException('Payload webhook không hợp lệ (thiếu orderCode)');
      }

      const transactionId = orderCode.toString();

      const invoice = await this.invoiceRepo.findByTransactionId(transactionId);
      if (!invoice) {
        throw new BadRequestException('Không tìm thấy hoá đơn tương ứng');
      }

      if (invoice.status === InvoiceStatus.PAID) {
        this.logger.warn(`Webhook trùng: Giao dịch ${orderCode} đã thành công trước đó`);
        return { received: true };
      }

      if (webhookData.success) {
        await this.invoiceRepo.updateStatusByTransactionId(transactionId, InvoiceStatus.PAID);
      }

      return { received: true };
    } catch (error) {
      this.logger.error('Xử lý webhook PayOS thất bại', error, InvoiceService.name, {
        orderCode
      });
      throw error;
    }
  }
}
