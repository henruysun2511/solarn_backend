import { Injectable } from '@nestjs/common';
import { AttendanceStatus, ClassSessionStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { ClassSearchByCourseDto, ClassSearchByTeacherDto } from '../dtos';

interface CreateClassData {
  classData: {
    classCode: string;
    startDate: Date;
    maxStudents: number;
    courseId: string;
    teacherId: string;
    scheduleTemplateId: string;
    roomCode: string;
  };
  sessions: Array<{
    shiftCode: string;
    studyDate: Date;
  }>;
}

interface RoomSessionConflictSession {
  shiftCode: string;
  studyDate: Date;
}

interface RoomSessionConflict {
  classId: string;
  session: RoomSessionConflictSession;
}

@Injectable()
export class ClassRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(classId: string) {
    return this.prisma.class.findUnique({
      where: { classId },
      select: { classId: true, startDate: true, maxStudents: true, courseId: true }
    });
  }

  findClassDetail(classId: string) {
    return this.prisma.class.findUnique({
      where: { classId },
      select: {
        classId: true,
        maxStudents: true,
        startDate: true,
        roomCode: true,
        _count: {
          select: { enrollments: true }
        },
        scheduleTemplate: {
          select: {
            templateId: true,
            templateName: true,
            weekdays: true,
            shiftCode: true
          }
        },
        teacher: {
          select: {
            teacherId: true,
            teacherCode: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        course: {
          select: {
            courseId: true,
            courseName: true,
            tuitionFee: true,
            totalSessions: true
          }
        },
        room: {
          select: {
            roomCode: true,
            capacity: true
          }
        }
      }
    });
  }

  async getAttendanceStats(classId: string) {
    const attendances = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { session: { classId, status: ClassSessionStatus.ENDED } },
      _count: { _all: true }
    });

    let attended = 0;
    let absent = 0;
    for (const record of attendances) {
      if (record.status === AttendanceStatus.ABSENT) {
        absent += record._count._all;
      } else {
        attended += record._count._all;
      }
    }

    const totalAttendance = attended + absent;
    const averageAttendanceRate = totalAttendance === 0 ? 0 : Math.round((attended / totalAttendance) * 10000) / 100;

    const endedSessions = await this.prisma.scheduleSession.count({
      where: { classId, status: ClassSessionStatus.ENDED }
    });

    return {
      endedSessions,
      averageAttendanceRate
    };
  }

  async getClassMeta(classId: string): Promise<{
    classId: string;
    courseId: string;
    isOngoing: boolean;
  } | null> {
    const cls = await this.prisma.class.findUnique({
      where: { classId },
      select: {
        classId: true,
        courseId: true,
        sessions: { select: { status: true } }
      }
    });

    if (!cls) return null;

    const isOngoing = cls.sessions.some((s) => s.status !== ClassSessionStatus.ENDED);
    return { classId: cls.classId, courseId: cls.courseId, isOngoing };
  }

  async getTuitionFeeByClassId(classId: string): Promise<Prisma.Decimal | null> {
    const cls = await this.prisma.class.findUnique({
      where: { classId },
      select: {
        course: {
          select: {
            tuitionFee: true
          }
        }
      }
    });

    return cls?.course.tuitionFee ?? null;
  }

  findByRoomCode(roomCode: string) {
    return this.prisma.class.findFirst({
      where: { roomCode },
      select: { classId: true, roomCode: true }
    });
  }

  async findRoomSessionConflicts(
    roomCode: string,
    sessions: RoomSessionConflictSession[]
  ): Promise<RoomSessionConflict[]> {
    if (sessions.length === 0) {
      return [];
    }

    const sessionKeys = new Set(sessions.map((session) => `${session.shiftCode}__${session.studyDate.toISOString()}`));

    const classes = await this.prisma.class.findMany({
      where: { roomCode },
      select: {
        classId: true,
        sessions: {
          select: {
            shiftCode: true,
            studyDate: true,
            status: true
          }
        }
      }
    });

    return classes.flatMap((classItem) => {
      const isCompleted =
        classItem.sessions.length > 0 &&
        classItem.sessions.every((session) => session.status === ClassSessionStatus.ENDED);
      if (isCompleted) {
        return [];
      }

      return classItem.sessions
        .filter((session) => sessionKeys.has(`${session.shiftCode}__${session.studyDate.toISOString()}`))
        .map((session) => ({
          classId: classItem.classId,
          session: {
            shiftCode: session.shiftCode,
            studyDate: session.studyDate
          }
        }));
    });
  }

  async create(data: CreateClassData) {
    return this.prisma.$transaction(async (tx) => {
      const createdClass = await tx.class.create({
        data: {
          classCode: data.classData.classCode,
          startDate: data.classData.startDate,
          maxStudents: data.classData.maxStudents,
          course: {
            connect: {
              courseId: data.classData.courseId
            }
          },
          teacher: {
            connect: {
              teacherId: data.classData.teacherId
            }
          },
          scheduleTemplate: {
            connect: {
              templateId: data.classData.scheduleTemplateId
            }
          },
          room: {
            connect: {
              roomCode: data.classData.roomCode
            }
          }
        }
      });

      await tx.scheduleSession.createMany({
        data: data.sessions.map((session) => ({
          classId: createdClass.classId,
          shiftCode: session.shiftCode,
          studyDate: session.studyDate
        }))
      });

      return createdClass;
    });
  }

  private buildWhere(courseId: string, query: ClassSearchByCourseDto): Prisma.ClassWhereInput {
    const { search } = query;

    return {
      courseId,
      ...(search && {
        classId: this.isValidUuid(search.trim()) ? search.trim() : undefined
      })
    };
  }

  private isValidUuid(value: string): boolean {
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidRegex.test(value);
  }

  async findManyByCourseId(courseId: string, query: ClassSearchByCourseDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(courseId, query);

    return this.prisma.class.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        classId: true,
        classCode: true,
        maxStudents: true,
        startDate: true,
        roomCode: true,
        _count: {
          select: {
            enrollments: true
          }
        },
        scheduleTemplate: {
          select: {
            templateId: true,
            templateName: true,
            weekdays: true,
            shiftCode: true
          }
        },
        teacher: {
          select: {
            teacherId: true,
            teacherCode: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    });
  }

  async countByCourseId(courseId: string, query: ClassSearchByCourseDto): Promise<number> {
    return this.prisma.class.count({
      where: this.buildWhere(courseId, query)
    });
  }

  private buildTeacherWhere(teacherId: string, query: ClassSearchByTeacherDto): Prisma.ClassWhereInput {
    const { search } = query;

    return {
      teacherId,
      ...(search && {
        classId: this.isValidUuid(search.trim()) ? search.trim() : undefined
      })
    };
  }

  async findManyByTeacherId(teacherId: string, query: ClassSearchByTeacherDto) {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildTeacherWhere(teacherId, query);

    return this.prisma.class.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      select: {
        classId: true,
        maxStudents: true,
        startDate: true,
        roomCode: true,
        _count: {
          select: {
            enrollments: true
          }
        },
        course: {
          select: {
            courseId: true,
            courseName: true
          }
        },
        scheduleTemplate: {
          select: {
            templateId: true,
            templateName: true,
            weekdays: true,
            shiftCode: true
          }
        },
        teacher: {
          select: {
            teacherId: true,
            teacherCode: true,
            profile: {
              select: {
                fullName: true,
                avatarUrl: true
              }
            }
          }
        },
        room: {
          select: {
            roomCode: true
          }
        }
      }
    });
  }

  async countByTeacherId(teacherId: string, query: ClassSearchByTeacherDto): Promise<number> {
    return this.prisma.class.count({
      where: this.buildTeacherWhere(teacherId, query)
    });
  }
}
