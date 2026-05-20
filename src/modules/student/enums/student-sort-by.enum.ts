export const StudentSortBy = {
  NAME: 'name',
  CREATED_AT: 'createdAt'
} as const;
export type StudentSortBy = (typeof StudentSortBy)[keyof typeof StudentSortBy];
