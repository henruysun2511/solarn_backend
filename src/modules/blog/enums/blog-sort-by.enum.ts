export const BlogSortBy = {
  TITLE: 'title',
  PUBLISHED_AT: 'publishedAt',
  CREATED_AT: 'createdAt'
} as const;

export type BlogSortBy = (typeof BlogSortBy)[keyof typeof BlogSortBy];
