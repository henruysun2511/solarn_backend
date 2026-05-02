import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { ResourceType } from '@prisma/client';

export class CreateCourseResourceDto {
  @ApiProperty({ example: 'Bài giảng 1', description: 'Tiêu đề tài nguyên' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'https://cdn.example.com/file.pdf', description: 'URL file' })
  @IsUrl()
  @IsNotEmpty()
  fileUrl: string;

  @ApiProperty({ enum: ResourceType, example: ResourceType.DOCUMENT })
  @IsEnum(ResourceType)
  @IsNotEmpty()
  type: ResourceType;
}
