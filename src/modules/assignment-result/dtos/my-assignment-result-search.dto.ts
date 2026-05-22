import { IsOptional, IsString, IsUUID } from 'class-validator';
import { SearchDto } from 'shared/base';

export class MyAssignmentResultSearchDto extends SearchDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';
}
