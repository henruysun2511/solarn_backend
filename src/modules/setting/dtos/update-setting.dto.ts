import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSettingDto {
  @ApiPropertyOptional({ example: 'SOLARN', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  siteName?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '1900123456', maxLength: 20 })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  hotline?: string;

  @ApiPropertyOptional({ example: 'contact@solarn.edu.vn', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional({ example: '123 Lê Lợi, Quận 1, TP.HCM' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'SOLARN - Trung tâm đào tạo', maxLength: 255 })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({ example: 'SOLARN là trung tâm đào tạo...' })
  @IsString()
  @IsOptional()
  metaDescription?: string;
}
