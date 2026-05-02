import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'common/decorators';
import { SortOrder } from 'common/enums';
import { SwaggerDoc } from 'common/swagger';

import { AccountSearchDto, CreateAccountDto, UpdateAccountStatusDto } from '../dtos';
import { AccountSortBy } from '../enums/account-sort-by.enum';
import { AccountService } from '../services/account.service';

@Controller('accounts')
@ApiTags('Accounts')
@ApiBearerAuth()
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @SwaggerDoc({
    summary: 'Get All Accounts',
    description: 'Retrieve accounts with pagination, sorting, and filters.',
    status: 200
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by username' })
  @ApiQuery({ name: 'username', required: false, type: String, description: 'Query by exact or partial username' })
  @ApiQuery({ name: 'roleId', required: false, type: String, description: 'Filter by roleId' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    enum: SortOrder,
    description: 'Sort order (desc or asc).',
    example: SortOrder.DESC
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: Object.values(AccountSortBy),
    description: 'Sort field for accounts.'
  })
  @Public()
  @Get()
  @ResponseMessage('Lấy danh sách tài khoản thành công')
  async findAll(@Query() query: AccountSearchDto) {
    return this.accountService.findAll(query);
  }

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
