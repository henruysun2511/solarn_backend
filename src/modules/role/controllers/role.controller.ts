import { Body, Controller, Post } from '@nestjs/common';
import { ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { ApiTags } from '@nestjs/swagger';

import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos';

@Controller('roles')
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @SwaggerDoc({
    summary: 'Create Role',
    bodyType: CreateRoleDto,
    status: 201
  })
  @Post('')
  @ResponseMessage('Tạo thành công')
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }
}
