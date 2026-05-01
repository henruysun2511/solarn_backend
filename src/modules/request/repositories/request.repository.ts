import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RequestType, RequestStatus } from '@prisma/client';

@Injectable()
export class RequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  createSalaryComplaint(data: { senderAccountId: string; salaryId: string; proposedAmount: number; reason: string }) {
    return this.prisma.request.create({
      data: {
        type: RequestType.SALARY_COMPLAINT,
        senderAccountId: data.senderAccountId,
        salaryId: data.salaryId,
        proposedAmount: data.proposedAmount,
        reason: data.reason,
        status: RequestStatus.PENDING
      },
      select: {
        requestId: true,
        type: true,
        status: true,
        salaryId: true,
        proposedAmount: true,
        reason: true,
        createdAt: true
      }
    });
  }
}
