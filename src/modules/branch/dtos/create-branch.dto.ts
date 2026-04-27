import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({ example: 'CS01', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  branchCode: string;

  @ApiProperty({ example: 'Cơ sở Quận 1', maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  branchName: string;

  @ApiProperty({ example: '123 Lê Lợi, Quận 1, TP.HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: '0901234567', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
