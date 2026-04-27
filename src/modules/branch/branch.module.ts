import { Module } from '@nestjs/common';

import { BranchService } from './services/branch.service';
import { BranchController } from './controllers/branch.controller';
import { BranchRepository } from './repositories/branch.repository';

@Module({
  controllers: [BranchController],
  providers: [BranchService, BranchRepository]
})
export class BranchModule {}
