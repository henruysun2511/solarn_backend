import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({ data });
  }
}
