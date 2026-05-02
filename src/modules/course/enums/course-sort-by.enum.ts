export const CourseSortBy = {
  COURSE_NAME: 'courseName',
  TUITION_FEE: 'tuitionFee',
  LEVEL: 'level'
} as const;

export type CourseSortBy = (typeof CourseSortBy)[keyof typeof CourseSortBy];
