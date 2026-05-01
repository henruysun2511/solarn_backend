import { Injectable } from '@nestjs/common';
import { ClassSessionStatus } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

interface CreateClassData {
  classData: {
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
      select: { classId: true, startDate: true, maxStudents: true }
    });
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
}
