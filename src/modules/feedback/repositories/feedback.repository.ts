import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class FeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { studentId: string; classId: string; teacherId: string; content: string }) {
    return this.prisma.feedback.create({
      data: {
        student: { connect: { studentId: data.studentId } },
        class: { connect: { classId: data.classId } },
        teacher: { connect: { teacherId: data.teacherId } },
        content: data.content
      },
      select: {
        feedbackId: true,
        studentId: true,
        classId: true,
        teacherId: true,
        content: true,
        createdAt: true
      }
    });
  }
}
