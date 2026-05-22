import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateFeedbackDto {
  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({ format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ example: 'Giáo viên rất nhiệt tình' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 5, description: 'Star rating (1-5)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  starRating: number;
}
