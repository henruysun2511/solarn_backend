import { Body, Controller, Get, Post } from '@nestjs/common';
import { Public, ResponseMessage } from 'common/decorators';
import { SwaggerDoc } from 'common/swagger';
import { ApiTags } from '@nestjs/swagger';

import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dtos';

@Controller('roles')
@ApiTags('Roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @SwaggerDoc({
    summary: 'Get All Roles',
    status: 200
  })
  @Get('')
  @ResponseMessage('Lấy danh sách quyền thành công')
  async findAll() {
    return this.roleService.findAll();
  }

  @Public()
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
