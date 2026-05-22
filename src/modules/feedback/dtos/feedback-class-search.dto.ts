import { IsEnum, IsOptional } from 'class-validator';
import { SearchDto } from 'shared/base';

import { FeedbackClassSortBy } from '../enums/feedback-sort-by.enum';

export class FeedbackClassSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(FeedbackClassSortBy)
  sortBy: FeedbackClassSortBy = FeedbackClassSortBy.CREATED_AT;
}
