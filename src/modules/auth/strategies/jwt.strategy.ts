import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IAccountRequest } from 'common/interfaces';

import { JwtAccessPayload } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!secret) throw new Error('JWT_ACCESS_TOKEN_SECRET not configured');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret
    });
  }
  async validate(payload: JwtAccessPayload): Promise<IAccountRequest> {
    return {
      accountId: payload.sub,
      username: payload.username,
      roleId: payload.roleId,
      roleName: payload.roleName
    };
  }
}
