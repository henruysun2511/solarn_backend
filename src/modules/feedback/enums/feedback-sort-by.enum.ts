export const FeedbackClassSortBy = {
  CREATED_AT: 'createdAt'
} as const;
export type FeedbackClassSortBy = (typeof FeedbackClassSortBy)[keyof typeof FeedbackClassSortBy];
