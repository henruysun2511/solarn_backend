import { Injectable } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { InvoiceSearchDto } from '../dtos';

@Injectable()
export class InvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(args: Prisma.InvoiceCreateArgs) {
    return this.prisma.invoice.create(args);
  }

  findByTransactionId(transactionId: string) {
    return this.prisma.invoice.findUnique({
      where: { transactionId }
    });
  }

  updateStatusByTransactionId(transactionId: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({
      where: { transactionId },
      data: { status }
    });
  }

  private buildStudentWhere(studentId: string, query: InvoiceSearchDto): Prisma.InvoiceWhereInput {
    const { search, status, classId } = query;
    return {
      studentId,
      ...(status && { status }),
      ...(classId && { classId }),
      ...(search && {
        class: {
          course: { courseName: { contains: search, mode: 'insensitive' } }
        }
      })
    };
  }

  async findManyByStudentId(studentId: string, query: InvoiceSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.invoice.findMany({
      where: this.buildStudentWhere(studentId, query),
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        invoiceId: true,
        studentId: true,
        classId: true,
        amount: true,
        status: true,
        transactionId: true,
        createdAt: true,
        class: {
          select: {
            roomCode: true,
            course: { select: { courseName: true } }
          }
        }
      }
    });
  }

  async countByStudentId(studentId: string, query: InvoiceSearchDto): Promise<number> {
    return this.prisma.invoice.count({
      where: this.buildStudentWhere(studentId, query)
    });
  }
}
