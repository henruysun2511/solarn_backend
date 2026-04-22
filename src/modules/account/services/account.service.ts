import { BadRequestException, Injectable } from '@nestjs/common';
import { hashPassword } from 'common/utils';

import { AccountRepository } from '../repositories/account.repository';
import { CreateAccountDto } from '../dtos';

@Injectable()
export class AccountService {
  constructor(private readonly accountRepo: AccountRepository) {}

  async create(accountDto: CreateAccountDto) {
    if (accountDto.password !== accountDto.passwordConfirm) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const passwordHash = await hashPassword(accountDto.password);

    return this.accountRepo.createWithProfile({
      username: accountDto.username,
      passwordHash,
      roleId: accountDto.roleId,
      salaryRate: accountDto.salaryRate,
      profile: accountDto.profile ? { fullName: accountDto.profile.fullName } : undefined
    });
  }
}
