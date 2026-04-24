import { Module } from '@nestjs/common';
import { AccountModule } from 'modules/account/account.module';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';

@Module({
  imports: [AccountModule],
  controllers: [AuthController],
  providers: [AuthService, OtpRepository, OtpService]
})
export class AuthModule {}
