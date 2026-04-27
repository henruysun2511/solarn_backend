import { Injectable } from '@nestjs/common';

import { BranchRepository } from '../repositories/branch.repository';
import { CreateBranchDto } from '../dtos';

@Injectable()
export class BranchService {
  constructor(private readonly branchRepo: BranchRepository) {}

  async create(branchDto: CreateBranchDto) {
    return this.branchRepo.create(branchDto);
  }
}
