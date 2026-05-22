export const TeacherSortBy = {
  NAME: 'name',
  CODE: 'code'
} as const;
export type TeacherSortBy = (typeof TeacherSortBy)[keyof typeof TeacherSortBy];
