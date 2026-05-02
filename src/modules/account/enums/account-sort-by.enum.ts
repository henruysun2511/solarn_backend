export const AccountSortBy = {
  USERNAME: 'username',
  CREATED_AT: 'createdAt',
  STATUS: 'status'
} as const;

export type AccountSortBy = (typeof AccountSortBy)[keyof typeof AccountSortBy];
