import { Injectable } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(args: Prisma.InvoiceCreateArgs) {
    return this.prisma.invoice.create(args);
  }

  findByTransactionId(transactionId: string) {
    return this.prisma.invoice.findUnique({
      where: {
        transactionId
      }
    });
  }

  updateStatusByTransactionId(transactionId: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({
      where: {
        transactionId
      },
      data: {
        status
      }
    });
  }
}
