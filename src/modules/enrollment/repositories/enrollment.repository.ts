import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

import { EnrollmentSearchDto } from '../dtos';

@Injectable()
export class EnrollmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByStudentAndClass(studentId: string, classId: string) {
    return this.prisma.enrollment.findUnique({
      where: {
        studentId_classId: {
          studentId,
          classId
        }
      }
    });
  }

  findByIdWithStudentAndClass(enrollmentId: string) {
    return this.prisma.enrollment.findUnique({
      where: { enrollmentId },
      select: {
        enrollmentId: true,
        studentId: true,
        classId: true,
        status: true,
        class: {
          select: {
            classId: true
          }
        }
      }
    });
  }

  countActiveByClassId(classId: string) {
    return this.prisma.enrollment.count({
      where: {
        classId,
        NOT: { status: EnrollmentStatus.DROPPED }
      }
    });
  }

  create(studentId: string, classId: string, status: EnrollmentStatus) {
    return this.prisma.enrollment.create({
      data: {
        student: { connect: { studentId } },
        class: { connect: { classId } },
        status
      }
    });
  }

  findStudentClassPairs(studentIds: string[], classIds: string[]) {
    return this.prisma.enrollment.findMany({
      where: {
        studentId: { in: studentIds },
        classId: { in: classIds }
      },
      select: { studentId: true, classId: true }
    });
  }

  findStudentClassStatusPairs(studentIds: string[], classIds: string[]) {
    return this.prisma.enrollment.findMany({
      where: {
        studentId: { in: studentIds },
        classId: { in: classIds }
      },
      select: { studentId: true, classId: true, status: true }
    });
  }

  findActiveEnrollmentsByCourseId(courseId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        class: { courseId },
        NOT: { status: EnrollmentStatus.DROPPED }
      },
      select: {
        enrollmentId: true,
        status: true,
        createdAt: true,
        studentId: true,
        classId: true,
        student: {
          select: {
            studentId: true,
            studentCode: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        class: {
          select: {
            classId: true,
            roomCode: true,
            startDate: true,
            course: {
              select: {
                courseId: true,
                courseName: true
              }
            }
          }
        }
      }
    });
  }

  findActiveEnrollmentsByStudentId(studentId: string) {
    return this.prisma.enrollment.findMany({
      where: {
        studentId,
        NOT: { status: EnrollmentStatus.DROPPED }
      },
      select: {
        enrollmentId: true,
        status: true,
        createdAt: true,
        studentId: true,
        classId: true,
        class: {
          select: {
            classId: true,
            roomCode: true,
            startDate: true,
            course: {
              select: {
                courseId: true,
                courseName: true,
                totalSessions: true
              }
            }
          }
        }
      }
    });
  }

  private buildWhere(query: EnrollmentSearchDto): Prisma.EnrollmentWhereInput {
    const { search, classId, status } = query;
    return {
      ...(classId && { classId }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { student: { studentCode: { contains: search, mode: 'insensitive' } } },
          { student: { profile: { fullName: { contains: search, mode: 'insensitive' } } } }
        ]
      })
    };
  }

  async findMany(query: EnrollmentSearchDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    return this.prisma.enrollment.findMany({
      where: this.buildWhere(query),
      skip,
      take: limit,
      orderBy: { [sortBy || 'createdAt']: sortOrder },
      include: {
        student: {
          select: {
            studentId: true,
            studentCode: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true,
                gender: true
              }
            }
          }
        },
        class: {
          select: {
            classId: true,
            classCode: true,
            roomCode: true,
            startDate: true,
            course: {
              select: {
                courseId: true,
                courseName: true
              }
            }
          }
        }
      }
    });
  }

  async count(query: EnrollmentSearchDto): Promise<number> {
    return this.prisma.enrollment.count({ where: this.buildWhere(query) });
  }

  findActiveEnrollmentsByClassIds(classIds: string[]) {
    return this.prisma.enrollment.findMany({
      where: {
        classId: { in: classIds },
        NOT: { status: EnrollmentStatus.DROPPED }
      },
      select: {
        enrollmentId: true,
        status: true,
        createdAt: true,
        studentId: true,
        classId: true,
        student: {
          select: {
            studentId: true,
            studentCode: true,
            profile: {
              select: {
                fullName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        class: {
          select: {
            classId: true,
            roomCode: true,
            startDate: true,
            course: {
              select: {
                courseId: true,
                courseName: true,
                totalSessions: true
              }
            }
          }
        }
      }
    });
  }
}
