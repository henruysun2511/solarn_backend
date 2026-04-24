import { BadRequestException, Injectable } from '@nestjs/common';
import { AppConfig } from 'common/constants';
import { hashPassword } from 'common/utils';
import { RoleService } from 'modules/role/services/role.service';

import { AccountRepository } from '../repositories/account.repository';
import { CreateAccountDto, RegisterStudentDto } from '../dtos';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly roleService: RoleService
  ) {}

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

  async registerStudent(dto: RegisterStudentDto) {
    if (dto.password !== dto.passwordConfirm) {
      throw new BadRequestException('Mật khẩu không khớp');
    }

    const studentRole = await this.roleService.getByName(AppConfig.ROLE.STUDENT);
    if (!studentRole) {
      throw new BadRequestException('Role STUDENT không tồn tại');
    }

    const passwordHash = await hashPassword(dto.password);

    const account = await this.accountRepo.registerStudentWithProfile({
      username: dto.username,
      passwordHash,
      studentRoleId: studentRole.roleId,
      profile: {
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        gender: dto.gender
      }
    });

    return {
      accountId: account.accountId,
      username: account.username,
      status: account.status,
      fullName: account.profile?.fullName ?? null,
      studentCode: account.profile?.student?.studentCode ?? null,
      createdAt: account.createdAt
    };
  }
}
