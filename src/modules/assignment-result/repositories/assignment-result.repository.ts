import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

export interface UpsertAssignmentResultItem {
  sessionId: string;
  studentId: string;
  score: number;
  feedback?: string;
}

@Injectable()
export class AssignmentResultRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create-only bulk insert.
   * If (sessionId, studentId) already exists, it will be skipped (no update).
   */
  upsertMany(items: UpsertAssignmentResultItem[], gradedById: string) {
    const gradedAt = new Date();

    return this.prisma.assignmentResult.createMany({
      data: items.map((item) => ({
        sessionId: item.sessionId,
        studentId: item.studentId,
        score: item.score,
        feedback: item.feedback,
        gradedById,
        gradedAt
      })),
      skipDuplicates: true
    });
  }
}
