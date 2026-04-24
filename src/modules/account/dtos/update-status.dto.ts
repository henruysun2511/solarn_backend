import { ApiProperty } from '@nestjs/swagger';
import { AccountStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateAccountStatusDto {
  @ApiProperty({ enum: AccountStatus, example: AccountStatus.ACTIVE })
  @IsEnum(AccountStatus)
  @IsNotEmpty()
  status: AccountStatus;
}
