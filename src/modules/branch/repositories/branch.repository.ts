import { Injectable } from '@nestjs/common';
import { Branch, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { BranchSearchDto } from '../dtos/branch-search.dto';
import { UpdateBranchDto } from '../dtos/update-branch.dto';

@Injectable()
export class BranchRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(query: BranchSearchDto): Prisma.BranchWhereInput {
    const { search } = query;

    return {
      ...(search && {
        OR: [
          { branchCode: { contains: search, mode: 'insensitive' } },
          { branchName: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(query.isActive !== undefined && { isActive: query.isActive })
    };
  }

  async findMany(query: BranchSearchDto): Promise<Branch[]> {
    const { skip, limit, sortBy, sortOrder } = query;
    const where = this.buildWhere(query);

    return this.prisma.branch.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder }
    });
  }

  async count(query: BranchSearchDto): Promise<number> {
    return this.prisma.branch.count({
      where: this.buildWhere(query)
    });
  }

  async create(data: Prisma.BranchCreateInput) {
    return this.prisma.branch.create({ data });
  }

  async update(branchId: string, data: UpdateBranchDto): Promise<Branch> {
    return await this.prisma.branch.update({
      where: { branchId },
      data
    });
  }

  // async softDelete(branchId: string): Promise<Branch> {
  //   return this.prisma.branch.update({
  //     where: { branchId },
  //     data: { isDeleted: true, deletedAt: new Date() }
  //   });
  // }

  async softDelete(branchId: string) {
    return await this.prisma.branch.delete({
      where: { branchId }
    });
  }
}
