import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { SearchDto } from 'shared/base';

import { FeedbackClassSortBy } from '../enums/feedback-sort-by.enum';

export class FeedbackSearchDto extends SearchDto {
  @IsOptional()
  @IsEnum(FeedbackClassSortBy)
  sortBy: FeedbackClassSortBy = FeedbackClassSortBy.CREATED_AT;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  starRating?: number;

  @IsOptional()
  isFeatured?: string;
}
