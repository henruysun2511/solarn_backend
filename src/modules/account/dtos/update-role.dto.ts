import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateAccountRoleDto {
  @ApiProperty({ example: 'uuid-role-id' })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
