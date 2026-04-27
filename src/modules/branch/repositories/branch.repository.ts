import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.BranchCreateInput) {
    return this.prisma.branch.create({ data });
  }
}
