export const ClassSortBy = {
  CLASS_ID: 'classId',
  START_DATE: 'startDate'
} as const;

export type ClassSortBy = (typeof ClassSortBy)[keyof typeof ClassSortBy];
