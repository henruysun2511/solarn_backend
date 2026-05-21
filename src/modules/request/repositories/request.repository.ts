import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { RequestType, RequestStatus, Prisma } from '@prisma/client';

import {
  SalaryComplaintSearchDto,
  TransferRequestSearchDto,
  LeaveRequestSearchDto,
  ScheduleChangeSearchDto
} from '../dtos';
import { RequestClassSearchDto } from '../dtos/request-class-search.dto';

@Injectable()
export class RequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(requestId: string) {
    return this.prisma.request.findUnique({
      where: { requestId },
      select: {
        requestId: true,
        type: true,
        status: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  approveRequest(data: { requestId: string; approverAccountId: string; approvalNote?: string }) {
    return this.prisma.request.update({
      where: { requestId: data.requestId },
      data: {
        status: RequestStatus.APPROVED,
        approverAccountId: data.approverAccountId,
        approvalNote: data.approvalNote
      },
      select: {
        requestId: true,
        type: true,
        status: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

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

  // ── SALARY_COMPLAINT ──────────────────────────────────────
  private buildSalaryComplaintWhere(query: SalaryComplaintSearchDto): Prisma.RequestWhereInput {
    const { search, status, senderAccountId, salaryId } = query;
    const where: Prisma.RequestWhereInput = {
      type: RequestType.SALARY_COMPLAINT
    };

    if (status) {
      where.status = status;
    }
    if (senderAccountId) {
      where.senderAccountId = senderAccountId;
    }
    if (salaryId) {
      where.salaryId = salaryId;
    }
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        {
          senderAccount: {
            profile: {
              fullName: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }
    return where;
  }

  async findManySalaryComplaints(query: SalaryComplaintSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildSalaryComplaintWhere(query);
    return this.prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        requestId: true,
        type: true,
        status: true,
        reason: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true,
        salaryId: true,
        proposedAmount: true,
        senderAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        },
        approverAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        salary: {
          select: {
            salaryId: true,
            salaryDate: true,
            totalAmount: true,
            bonus: true,
            deduction: true
          }
        }
      }
    });
  }

  async countSalaryComplaints(query: SalaryComplaintSearchDto): Promise<number> {
    return this.prisma.request.count({
      where: this.buildSalaryComplaintWhere(query)
    });
  }

  // ── TRANSFER_REQUEST ──────────────────────────────────────
  private buildTransferRequestWhere(query: TransferRequestSearchDto): Prisma.RequestWhereInput {
    const { search, status, senderAccountId, fromClassId, toClassId } = query;
    const where: Prisma.RequestWhereInput = {
      type: RequestType.TRANSFER_REQUEST
    };

    if (status) {
      where.status = status;
    }
    if (senderAccountId) {
      where.senderAccountId = senderAccountId;
    }
    if (fromClassId) {
      where.fromClassId = fromClassId;
    }
    if (toClassId) {
      where.toClassId = toClassId;
    }
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        {
          senderAccount: {
            profile: {
              fullName: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }
    return where;
  }

  async findManyTransferRequests(query: TransferRequestSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildTransferRequestWhere(query);
    return this.prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        requestId: true,
        type: true,
        status: true,
        reason: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true,
        fromClassId: true,
        toClassId: true,
        senderAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        },
        approverAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        fromClass: {
          select: {
            classId: true,
            roomCode: true,
            course: {
              select: {
                courseName: true
              }
            }
          }
        },
        toClass: {
          select: {
            classId: true,
            roomCode: true,
            course: {
              select: {
                courseName: true
              }
            }
          }
        }
      }
    });
  }

  async countTransferRequests(query: TransferRequestSearchDto): Promise<number> {
    return this.prisma.request.count({
      where: this.buildTransferRequestWhere(query)
    });
  }

  // ── LEAVE_REQUEST ─────────────────────────────────────────
  private buildLeaveRequestWhere(query: LeaveRequestSearchDto): Prisma.RequestWhereInput {
    const { search, status, senderAccountId, enrollmentId } = query;
    const where: Prisma.RequestWhereInput = {
      type: RequestType.LEAVE_REQUEST
    };

    if (status) {
      where.status = status;
    }
    if (senderAccountId) {
      where.senderAccountId = senderAccountId;
    }
    if (enrollmentId) {
      where.enrollmentId = enrollmentId;
    }
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        {
          senderAccount: {
            profile: {
              fullName: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }
    return where;
  }

  async findManyLeaveRequests(query: LeaveRequestSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildLeaveRequestWhere(query);
    return this.prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        requestId: true,
        type: true,
        status: true,
        reason: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true,
        enrollmentId: true,
        leaveStartDate: true,
        leaveEndDate: true,
        progressAtRequest: true,
        leaveStatus: true,
        senderAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        },
        approverAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        enrollment: {
          select: {
            enrollmentId: true,
            status: true,
            class: {
              select: {
                classId: true,
                roomCode: true,
                course: {
                  select: {
                    courseName: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async countLeaveRequests(query: LeaveRequestSearchDto): Promise<number> {
    return this.prisma.request.count({
      where: this.buildLeaveRequestWhere(query)
    });
  }

  // ── SCHEDULE_CHANGE ───────────────────────────────────────
  private buildScheduleChangeWhere(query: ScheduleChangeSearchDto): Prisma.RequestWhereInput {
    const { search, status, senderAccountId, sessionId } = query;
    const where: Prisma.RequestWhereInput = {
      type: RequestType.SCHEDULE_CHANGE
    };

    if (status) {
      where.status = status;
    }
    if (senderAccountId) {
      where.senderAccountId = senderAccountId;
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }
    if (search) {
      where.OR = [
        { reason: { contains: search, mode: 'insensitive' } },
        {
          senderAccount: {
            profile: {
              fullName: { contains: search, mode: 'insensitive' }
            }
          }
        }
      ];
    }
    return where;
  }

  async findManyScheduleChanges(query: ScheduleChangeSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildScheduleChangeWhere(query);
    return this.prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      select: {
        requestId: true,
        type: true,
        status: true,
        reason: true,
        senderAccountId: true,
        approverAccountId: true,
        approvalNote: true,
        createdAt: true,
        updatedAt: true,
        sessionId: true,
        proposedShiftCode: true,
        proposedStudyDate: true,
        senderAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        },
        approverAccount: {
          select: {
            accountId: true,
            username: true,
            profile: {
              select: {
                fullName: true,
                email: true
              }
            }
          }
        },
        session: {
          select: {
            sessionId: true,
            studyDate: true,
            shiftCode: true,
            class: {
              select: {
                classId: true,
                course: {
                  select: {
                    courseName: true
                  }
                }
              }
            }
          }
        },
        proposedShift: {
          select: {
            shiftId: true,
            shiftCode: true,
            shiftName: true,
            timeRange: true
          }
        }
      }
    });
  }

  async countScheduleChanges(query: ScheduleChangeSearchDto): Promise<number> {
    return this.prisma.request.count({
      where: this.buildScheduleChangeWhere(query)
    });
  }

  async findManyByClassId(classId: string, query: RequestClassSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where: import('@prisma/client').Prisma.RequestWhereInput = {
      OR: [{ session: { classId } }, { enrollment: { classId } }, { fromClassId: classId }, { toClassId: classId }]
    };
    return this.prisma.request.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { senderAccount: { include: { profile: true } } }
    });
  }

  async countByClassIdQuery(classId: string, query: RequestClassSearchDto) {
    const where: import('@prisma/client').Prisma.RequestWhereInput = {
      OR: [{ session: { classId } }, { enrollment: { classId } }, { fromClassId: classId }, { toClassId: classId }]
    };
    return this.prisma.request.count({ where });
  }
}
