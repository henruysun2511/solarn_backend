import { ApiProperty } from '@nestjs/swagger';
import { ClassSessionStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateSessionStatusDto {
  @ApiProperty({ enum: ClassSessionStatus, example: ClassSessionStatus.IN_PROGRESS })
  @IsEnum(ClassSessionStatus)
  status: ClassSessionStatus;
}
