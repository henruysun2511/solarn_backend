export const LeaveRequestSortBy = {
  CREATED_AT: 'createdAt',
  LEAVE_START_DATE: 'leaveStartDate',
  LEAVE_END_DATE: 'leaveEndDate',
  PROGRESS_AT_REQUEST: 'progressAtRequest'
} as const;

export type LeaveRequestSortBy = (typeof LeaveRequestSortBy)[keyof typeof LeaveRequestSortBy];

export const TransferRequestSortBy = {
  CREATED_AT: 'createdAt'
} as const;

export type TransferRequestSortBy = (typeof TransferRequestSortBy)[keyof typeof TransferRequestSortBy];

export const ReEnrollmentRequestSortBy = {
  CREATED_AT: 'createdAt'
} as const;

export type ReEnrollmentRequestSortBy = (typeof ReEnrollmentRequestSortBy)[keyof typeof ReEnrollmentRequestSortBy];

export const SalaryComplaintSortBy = {
  CREATED_AT: 'createdAt',
  PROPOSED_AMOUNT: 'proposedAmount'
} as const;

export type SalaryComplaintSortBy = (typeof SalaryComplaintSortBy)[keyof typeof SalaryComplaintSortBy];

export const ScheduleChangeSortBy = {
  CREATED_AT: 'createdAt',
  PROPOSED_STUDY_DATE: 'proposedStudyDate'
} as const;

export type ScheduleChangeSortBy = (typeof ScheduleChangeSortBy)[keyof typeof ScheduleChangeSortBy];

export const RequestClassSortBy = {
  CREATED_AT: 'createdAt',
  STATUS: 'status'
} as const;
export type RequestClassSortBy = (typeof RequestClassSortBy)[keyof typeof RequestClassSortBy];
