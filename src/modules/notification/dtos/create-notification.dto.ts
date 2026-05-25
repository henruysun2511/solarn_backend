import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType, Prisma } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Thông báo hệ thống' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Nội dung thông báo...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ enum: NotificationType, example: NotificationType.SYSTEM })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ example: { foo: 'bar' } })
  @IsOptional()
  @IsObject()
  metadata?: Prisma.InputJsonValue;
}
