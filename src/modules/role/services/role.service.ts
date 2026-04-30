import { Injectable } from '@nestjs/common';

import { RoleRepository } from '../repositories/role.repository';
import { CreateRoleDto } from '../dtos';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepo: RoleRepository) {}

  async create(roleDto: CreateRoleDto) {
    return this.roleRepo.create(roleDto);
  }

  async getByName(roleName: string) {
    return this.roleRepo.findByName(roleName);
  }

  async getNameByRoleId(roleId: string) {
    return this.roleRepo.getNameByRoleId(roleId);
  }
}
