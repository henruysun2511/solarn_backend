import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.RoleCreateInput) {
    return this.prisma.role.create({ data });
  }

  async findByName(roleName: string) {
    return this.prisma.role.findUnique({
      where: { roleName }
    });
  }

  async getNameByRoleId(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { roleId },
      select: { roleName: true }
    });

    return role?.roleName ?? null;
  }
}
