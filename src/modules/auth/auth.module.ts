import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AccountModule } from 'modules/account/account.module';
import { RoleModule } from 'modules/role/role.module';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { OtpRepository } from './repositories/otp.repository';
import { OtpService } from './services/otp.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [AccountModule, PassportModule, RoleModule],
  controllers: [AuthController],
  providers: [AuthService, OtpRepository, OtpService, AuthRepository, JwtStrategy, LocalStrategy]
})
export class AuthModule {}
