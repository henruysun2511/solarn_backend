export const ScheduleTemplateSortBy = {
  TEMPLATE_NAME: 'templateName',
  SHIFT_CODE: 'shiftCode'
} as const;

export type ScheduleTemplateSortBy = (typeof ScheduleTemplateSortBy)[keyof typeof ScheduleTemplateSortBy];
