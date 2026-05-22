import { Injectable } from '@nestjs/common';
import { Token } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { accountId: string; token: string; expiresAt: Date }): Promise<Token> {
    return await this.prisma.token.create({ data });
  }

  async deleteTokenByAccountIdAndToken(accountId: string, token: string): Promise<void> {
    await this.prisma.token.deleteMany({ where: { accountId, token } });
  }

  findTokenByAccountIdAndToken(accountId: string, token: string): Promise<Token | null> {
    return this.prisma.token.findUnique({ where: { accountId, token } });
  }
}
