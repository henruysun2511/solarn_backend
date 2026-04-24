import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';
import { RoleModule } from 'modules/role/role.module';

import { AccountService } from './services/account.service';
import { AccountController } from './controllers/account.controller';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [PrismaModule, RoleModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository],
  exports: [AccountService]
})
export class AccountModule {}
