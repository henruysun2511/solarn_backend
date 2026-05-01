export const StudyShiftSortBy = {
  SHIFT_CODE: 'shiftCode',
  SHIFT_NAME: 'shiftName',
  TIME_RANGE: 'timeRange'
} as const;

export type StudyShiftSortBy = (typeof StudyShiftSortBy)[keyof typeof StudyShiftSortBy];
