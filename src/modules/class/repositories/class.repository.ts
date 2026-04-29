import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

interface CreateClassData {
  classData: {
    startDate: Date;
    maxStudents: number;
    courseId: string;
    teacherId: string;
    scheduleTemplateId: string;
  };
  sessions: Array<{
    shiftCode: string;
    studyDate: Date;
  }>;
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
