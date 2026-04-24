import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from 'modules/role/role.module';
import { SharedModule } from 'shared/shared.module';
import { CourseModule } from 'modules/course/course.module';
import { ClassModule } from 'modules/class/class.module';

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
    CourseModule,
    ClassModule,
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
