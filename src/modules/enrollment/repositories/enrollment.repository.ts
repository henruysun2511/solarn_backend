import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { EnrollmentStatus } from '@prisma/client';

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
            startDate: true
          }
        }
      }
    });
  }
}
