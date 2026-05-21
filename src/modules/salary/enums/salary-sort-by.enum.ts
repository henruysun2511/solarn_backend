export const SalarySortBy = {
  SALARY_DATE: 'salaryDate',
  TOTAL_SESSIONS: 'totalSessions',
  TOTAL_AMOUNT: 'totalAmount'
} as const;

export type SalarySortBy = (typeof SalarySortBy)[keyof typeof SalarySortBy];
