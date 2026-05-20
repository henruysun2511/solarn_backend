export const StudentSortBy = {
  NAME: 'name'
} as const;
export type StudentSortBy = (typeof StudentSortBy)[keyof typeof StudentSortBy];
