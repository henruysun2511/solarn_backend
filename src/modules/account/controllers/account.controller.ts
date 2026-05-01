import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDoc } from 'common/swagger';
import { Public } from 'common/decorators';

import { AccountService } from '../services/account.service';
import { CreateAccountDto, UpdateAccountStatusDto } from '../dtos';

@Controller('accounts')
@ApiTags('Accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Public()
  @SwaggerDoc({
    summary: 'Create Account',
    bodyType: CreateAccountDto,
    status: 201
  })
  @Post()
  async create(@Body() accountDto: CreateAccountDto) {
    return this.accountService.create(accountDto);
  }

  @SwaggerDoc({
    summary: 'Change account status (ACTIVE/INACTIVE)',
    bodyType: UpdateAccountStatusDto,
    status: 200
  })
  @Patch(':accountId/status')
  async changeStatus(@Param('accountId') accountId: string, @Body() dto: UpdateAccountStatusDto) {
    return this.accountService.changeStatus(accountId, dto.status);
  }
}
