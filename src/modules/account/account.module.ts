import { Module } from '@nestjs/common';
import { PrismaModule } from 'prisma/prisma.module';

import { AccountService } from './services/account.service';
import { AccountController } from './controllers/account.controller';
import { AccountRepository } from './repositories/account.repository';

@Module({
  imports: [PrismaModule],
  controllers: [AccountController],
  providers: [AccountService, AccountRepository]
})
export class AccountModule {}
