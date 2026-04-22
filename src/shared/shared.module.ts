import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from 'common/exceptions';
import { PrismaModule } from 'prisma/prisma.module';

import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [
    LoggerModule,
    PrismaModule
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: (configService: ConfigService) => ({
    //     secret: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    //     signOptions: {
    //       expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRE') || '100m'
    //     }
    //   })
    // })
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ],
  exports: [LoggerModule, PrismaModule]
})
export class SharedModule {}
