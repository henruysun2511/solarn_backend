export const ScheduleSessionSortBy = {
  STUDY_DATE: 'studyDate',
  STATUS: 'status'
} as const;
export type ScheduleSessionSortBy = (typeof ScheduleSessionSortBy)[keyof typeof ScheduleSessionSortBy];
