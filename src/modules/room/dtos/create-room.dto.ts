import { ApiProperty } from '@nestjs/swagger';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ example: 'A101', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  roomCode: string;

  @ApiProperty({ example: 30, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiPropertyOptional({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  branchId?: string;
}
