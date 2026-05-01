import { Injectable } from '@nestjs/common';
import { paginate } from 'shared/helpers';

import { BranchSearchDto, CreateBranchDto } from '../dtos';
import { UpdateBranchDto } from '../dtos/update-branch.dto';
import { BranchRepository } from '../repositories/branch.repository';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: BranchRepository) {}

  async create(branchDto: CreateBranchDto) {
    return this.branchRepo.create(branchDto);
  }

  async findAll(query: BranchSearchDto) {
    const [data, total] = await Promise.all([this.branchRepo.findMany(query), this.branchRepo.count(query)]);
    return paginate(data, total, query);
  }

  async update(branchId: string, branchDto: UpdateBranchDto) {
    return await this.branchRepo.update(branchId, branchDto);
  }

  async softDelete(branchId: string) {
    return await this.branchRepo.softDelete(branchId);
  }
}
