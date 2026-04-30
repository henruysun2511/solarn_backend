import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { GradeStatus } from '@prisma/client';

export interface UpsertAssignmentResultItem {
  sessionId: string;
  studentId: string;
  score?: number;
  status?: GradeStatus;
  feedback?: string;
}

@Injectable()
export class AssignmentResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertMany(items: UpsertAssignmentResultItem[], gradedById: string) {
    const gradedAt = new Date();

    return this.prisma.$transaction(
      items.map((item) =>
        this.prisma.assignmentResult.upsert({
          where: {
            sessionId_studentId: {
              sessionId: item.sessionId,
              studentId: item.studentId
            }
          },
          update: {
            score: item.score,
            status: item.status,
            feedback: item.feedback,
            gradedById,
            gradedAt
          },
          create: {
            sessionId: item.sessionId,
            studentId: item.studentId,
            score: item.score,
            status: item.status ?? GradeStatus.GRADED,
            feedback: item.feedback,
            gradedById,
            gradedAt
          },
          select: {
            resultId: true,
            sessionId: true,
            studentId: true,
            score: true,
            status: true,
            feedback: true,
            gradedById: true,
            gradedAt: true,
            updatedAt: true
          }
        })
      )
    );
  }
}
