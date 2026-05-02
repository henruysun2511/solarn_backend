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

  createTransferRequest(data: { senderAccountId: string; fromClassId: string; toClassId: string; reason?: string }) {
    return this.prisma.request.create({
      data: {
        type: RequestType.TRANSFER_REQUEST,
        senderAccountId: data.senderAccountId,
        fromClassId: data.fromClassId,
        toClassId: data.toClassId,
        reason: data.reason || '',
        status: RequestStatus.PENDING
      },
      select: {
        requestId: true,
        type: true,
        status: true,
        fromClassId: true,
        toClassId: true,
        reason: true,
        createdAt: true
      }
    });
  }

  createLeaveRequest(data: {
    senderAccountId: string;
    enrollmentId: string;
    leaveStartDate: Date;
    leaveEndDate: Date;
    progressAtRequest: number;
    reason?: string;
  }) {
    return this.prisma.request.create({
      data: {
        type: RequestType.LEAVE_REQUEST,
        senderAccountId: data.senderAccountId,
        enrollmentId: data.enrollmentId,
        leaveStartDate: data.leaveStartDate,
        leaveEndDate: data.leaveEndDate,
        progressAtRequest: data.progressAtRequest,
        reason: data.reason || '',
        status: RequestStatus.PENDING
      },
      select: {
        requestId: true,
        type: true,
        status: true,
        enrollmentId: true,
        leaveStartDate: true,
        leaveEndDate: true,
        progressAtRequest: true,
        reason: true,
        createdAt: true
      }
    });
  }

  createScheduleChangeRequest(data: {
    senderAccountId: string;
    sessionId: string;
    proposedShiftCode: string;
    proposedStudyDate: Date;
    reason?: string;
  }) {
    return this.prisma.request.create({
      data: {
        type: RequestType.SCHEDULE_CHANGE,
        senderAccountId: data.senderAccountId,
        sessionId: data.sessionId,
        proposedShiftCode: data.proposedShiftCode,
        proposedStudyDate: data.proposedStudyDate,
        reason: data.reason || '',
        status: RequestStatus.PENDING
      },
      select: {
        requestId: true,
        type: true,
        status: true,
        sessionId: true,
        proposedShiftCode: true,
        proposedStudyDate: true,
        reason: true,
        createdAt: true
      }
    });
  }
}
