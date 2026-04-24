import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from 'modules/role/role.module';
import { SharedModule } from 'shared/shared.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AccountModule } from './modules/account/account.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AccountModule,
    AuthModule,
    RoleModule,
    SharedModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
