import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SwaggerDoc } from 'common/swagger';

import { AccountService } from '../services/account.service';
import { CreateAccountDto } from '../dtos';

@Controller('accounts')
@ApiTags('Accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SwaggerDoc({
    summary: 'Create Account',
    bodyType: CreateAccountDto,
    status: 201
  })
  @Post()
  async create(@Body() accountDto: CreateAccountDto) {
    return this.accountService.create(accountDto);
  }
}
