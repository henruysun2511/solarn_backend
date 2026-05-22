import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { StudentSortBy } from '../enums/student-sort-by.enum';

export class StudentSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(StudentSortBy)
  sortBy: StudentSortBy = StudentSortBy.NAME;
}
