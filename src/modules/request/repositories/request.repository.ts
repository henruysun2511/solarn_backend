import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EnrollmentStatus, LeaveStatus, Prisma, RequestStatus, RequestType } from '@prisma/client';

import {
  SalaryComplaintSearchDto,
  TransferRequestSearchDto,
  LeaveRequestSearchDto,
  ScheduleChangeSearchDto
} from '../dtos';

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

  async processScheduleChangeRequest(data: {
    requestId: string;
    approverAccountId: string;
    isSuccess: boolean;
    approvalNote?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { requestId: data.requestId },
        select: {
          requestId: true,
          type: true,
          status: true,
          sessionId: true,
          proposedShiftCode: true,
          proposedStudyDate: true
        }
      });

      if (!request) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      }

      if (request.type !== RequestType.SCHEDULE_CHANGE) {
        throw new BadRequestException('Request không phải loại đổi lịch/ca học');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu đã được xử lý');
      }

      // Thất bại/từ chối: chỉ cập nhật status request
      if (!data.isSuccess) {
        const updatedRequest = await tx.request.update({
          where: { requestId: request.requestId },
          data: {
            status: RequestStatus.REJECTED,
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
            sessionId: true,
            proposedShiftCode: true,
            proposedStudyDate: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return {
          request: updatedRequest,
          session: null
        };
      }

      // Thành công/duyệt: cập nhật session + cập nhật request trong cùng transaction
      if (!request.sessionId || !request.proposedShiftCode || !request.proposedStudyDate) {
        throw new BadRequestException('Request đổi lịch thiếu dữ liệu (sessionId/proposedShiftCode/proposedStudyDate)');
      }

      const session = await tx.scheduleSession.findUnique({
        where: { sessionId: request.sessionId },
        select: {
          sessionId: true,
          classId: true,
          shiftCode: true,
          studyDate: true,
          status: true
        }
      });

      if (!session) {
        throw new BadRequestException('Buổi học không tồn tại');
      }

      // Khi xử lý, mình rely vào unique constraint ở DB (classId, shiftCode, studyDate).
      let updatedSession;
      try {
        updatedSession = await tx.scheduleSession.update({
          where: { sessionId: request.sessionId },
          data: {
            shiftCode: request.proposedShiftCode,
            studyDate: request.proposedStudyDate
          },
          select: {
            sessionId: true,
            classId: true,
            shiftCode: true,
            studyDate: true,
            status: true
          }
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException({
            message: 'Lịch đề xuất bị trùng với buổi học khác',
            reason: 'SCHEDULE_SESSION_CONFLICT'
          });
        }
        throw err;
      }

      const updatedRequest = await tx.request.update({
        where: { requestId: request.requestId },
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
          sessionId: true,
          proposedShiftCode: true,
          proposedStudyDate: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        request: updatedRequest,
        session: updatedSession
      };
    });
  }

  async processSalaryComplaintRequest(data: {
    requestId: string;
    approverAccountId: string;
    isSuccess: boolean;
    approvalNote?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { requestId: data.requestId },
        select: {
          requestId: true,
          type: true,
          status: true,
          salaryId: true,
          proposedAmount: true
        }
      });

      if (!request) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      }

      if (request.type !== RequestType.SALARY_COMPLAINT) {
        throw new BadRequestException('Request không phải loại khiếu nại lương');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu đã được xử lý');
      }

      // Từ chối: chỉ cập nhật request
      if (!data.isSuccess) {
        const updatedRequest = await tx.request.update({
          where: { requestId: request.requestId },
          data: {
            status: RequestStatus.REJECTED,
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
            salaryId: true,
            proposedAmount: true,
            reason: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return {
          request: updatedRequest,
          salary: null
        };
      }

      // Chấp nhận: cập nhật Salary + request trong cùng transaction
      if (!request.salaryId || request.proposedAmount === null || request.proposedAmount === undefined) {
        throw new BadRequestException('Request khiếu nại lương thiếu dữ liệu (salaryId/proposedAmount)');
      }

      const salary = await tx.salary.findUnique({
        where: { salaryId: request.salaryId },
        select: {
          salaryId: true,
          teacherId: true,
          salaryDate: true,
          totalSessions: true,
          bonus: true,
          deduction: true,
          totalAmount: true
        }
      });

      if (!salary) {
        throw new BadRequestException('Bảng lương không tồn tại');
      }

      const updatedSalary = await tx.salary.update({
        where: { salaryId: salary.salaryId },
        data: {
          totalAmount: request.proposedAmount
        },
        select: {
          salaryId: true,
          teacherId: true,
          salaryDate: true,
          totalSessions: true,
          bonus: true,
          deduction: true,
          totalAmount: true
        }
      });

      const updatedRequest = await tx.request.update({
        where: { requestId: request.requestId },
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
          salaryId: true,
          proposedAmount: true,
          reason: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        request: updatedRequest,
        salary: updatedSalary
      };
    });
  }

  async processTransferRequest(data: {
    requestId: string;
    approverAccountId: string;
    isSuccess: boolean;
    approvalNote?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { requestId: data.requestId },
        select: {
          requestId: true,
          type: true,
          status: true,
          senderAccountId: true,
          fromClassId: true,
          toClassId: true
        }
      });

      if (!request) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      }

      if (request.type !== RequestType.TRANSFER_REQUEST) {
        throw new BadRequestException('Request không phải loại chuyển lớp');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu đã được xử lý');
      }

      if (!data.isSuccess) {
        const updatedRequest = await tx.request.update({
          where: { requestId: request.requestId },
          data: {
            status: RequestStatus.REJECTED,
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
            fromClassId: true,
            toClassId: true,
            reason: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return {
          request: updatedRequest,
          fromEnrollment: null,
          toEnrollment: null
        };
      }

      if (!request.fromClassId || !request.toClassId) {
        throw new BadRequestException('Request chuyển lớp thiếu dữ liệu (fromClassId/toClassId)');
      }

      const student = await tx.student.findFirst({
        where: {
          profile: {
            accountId: request.senderAccountId
          }
        },
        select: {
          studentId: true
        }
      });

      if (!student) {
        throw new BadRequestException('Học viên không tồn tại');
      }

      const fromEnrollment = await tx.enrollment.findUnique({
        where: {
          studentId_classId: {
            studentId: student.studentId,
            classId: request.fromClassId
          }
        },
        select: {
          enrollmentId: true,
          studentId: true,
          classId: true,
          status: true,
          createdAt: true
        }
      });

      if (!fromEnrollment || fromEnrollment.status === EnrollmentStatus.DROPPED) {
        throw new BadRequestException('Học viên không đang học lớp nguồn');
      }

      if (fromEnrollment.status === EnrollmentStatus.COMPLETED) {
        throw new BadRequestException('Enrollment đã hoàn thành, không thể chuyển lớp');
      }

      const toEnrollmentExisting = await tx.enrollment.findUnique({
        where: {
          studentId_classId: {
            studentId: student.studentId,
            classId: request.toClassId
          }
        },
        select: {
          enrollmentId: true,
          status: true
        }
      });

      if (toEnrollmentExisting && toEnrollmentExisting.status !== EnrollmentStatus.DROPPED) {
        throw new ConflictException('Học viên đã có enrollment ở lớp đích');
      }

      const updatedFromEnrollment = await tx.enrollment.update({
        where: { enrollmentId: fromEnrollment.enrollmentId },
        data: { status: EnrollmentStatus.DROPPED },
        select: {
          enrollmentId: true,
          studentId: true,
          classId: true,
          status: true,
          createdAt: true
        }
      });

      const nextStatus =
        fromEnrollment.status === EnrollmentStatus.NOT_STARTED
          ? EnrollmentStatus.NOT_STARTED
          : EnrollmentStatus.IN_PROGRESS;

      let createdToEnrollment;
      try {
        createdToEnrollment = await tx.enrollment.create({
          data: {
            student: { connect: { studentId: student.studentId } },
            class: { connect: { classId: request.toClassId } },
            status: nextStatus
          },
          select: {
            enrollmentId: true,
            studentId: true,
            classId: true,
            status: true,
            createdAt: true
          }
        });
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new ConflictException('Học viên đã có enrollment ở lớp đích');
        }
        throw err;
      }

      const updatedRequest = await tx.request.update({
        where: { requestId: request.requestId },
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
          fromClassId: true,
          toClassId: true,
          reason: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        request: updatedRequest,
        fromEnrollment: updatedFromEnrollment,
        toEnrollment: createdToEnrollment
      };
    });
  }

  async processLeaveRequest(data: {
    requestId: string;
    approverAccountId: string;
    isSuccess: boolean;
    approvalNote?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.request.findUnique({
        where: { requestId: data.requestId },
        select: {
          requestId: true,
          type: true,
          status: true,
          enrollmentId: true,
          leaveStartDate: true,
          leaveEndDate: true,
          leaveStatus: true
        }
      });

      if (!request) {
        throw new BadRequestException('Yêu cầu không tồn tại');
      }

      if (request.type !== RequestType.LEAVE_REQUEST) {
        throw new BadRequestException('Request không phải loại bảo lưu');
      }

      if (request.status !== RequestStatus.PENDING) {
        throw new ConflictException('Yêu cầu đã được xử lý');
      }

      if (!data.isSuccess) {
        const updatedRequest = await tx.request.update({
          where: { requestId: request.requestId },
          data: {
            status: RequestStatus.REJECTED,
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
            enrollmentId: true,
            leaveStartDate: true,
            leaveEndDate: true,
            progressAtRequest: true,
            leaveStatus: true,
            reason: true,
            createdAt: true,
            updatedAt: true
          }
        });

        return {
          request: updatedRequest,
          enrollment: null
        };
      }

      if (!request.enrollmentId || !request.leaveStartDate || !request.leaveEndDate) {
        throw new BadRequestException('Request bảo lưu thiếu dữ liệu (enrollmentId/leaveStartDate/leaveEndDate)');
      }

      const enrollment = await tx.enrollment.findUnique({
        where: { enrollmentId: request.enrollmentId },
        select: {
          enrollmentId: true,
          studentId: true,
          classId: true,
          status: true,
          createdAt: true
        }
      });

      if (!enrollment) {
        throw new BadRequestException('Enrollment không tồn tại');
      }

      if (enrollment.status === EnrollmentStatus.DROPPED) {
        throw new BadRequestException('Enrollment đã DROPPED, không thể bảo lưu');
      }

      if (enrollment.status === EnrollmentStatus.COMPLETED) {
        throw new BadRequestException('Enrollment đã COMPLETED, không thể bảo lưu');
      }

      if (enrollment.status === EnrollmentStatus.DEFERRED) {
        throw new ConflictException('Enrollment đã ở trạng thái DEFERRED');
      }

      const updatedEnrollment = await tx.enrollment.update({
        where: { enrollmentId: enrollment.enrollmentId },
        data: {
          status: EnrollmentStatus.DEFERRED
        },
        select: {
          enrollmentId: true,
          studentId: true,
          classId: true,
          status: true,
          createdAt: true
        }
      });

      const updatedRequest = await tx.request.update({
        where: { requestId: request.requestId },
        data: {
          status: RequestStatus.APPROVED,
          leaveStatus: LeaveStatus.ACTIVE,
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
          enrollmentId: true,
          leaveStartDate: true,
          leaveEndDate: true,
          progressAtRequest: true,
          leaveStatus: true,
          reason: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return {
        request: updatedRequest,
        enrollment: updatedEnrollment
      };
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
}
