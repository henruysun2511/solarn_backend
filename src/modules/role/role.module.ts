import { Module } from '@nestjs/common';

import { RoleService } from './services/role.service';
import { RoleController } from './controllers/role.controller';
import { RoleRepository } from './repositories/role.repository';

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository]
})
export class RoleModule {}
