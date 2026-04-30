export const SCHEDULE_SESSION_ERRORS = {
  SESSION_NOT_FOUND: {
    message: 'Buổi học không tồn tại',
    reason: 'SESSION_NOT_FOUND' as const
  },
  SESSION_DATE_MISMATCH: {
    message: 'Không thể cập nhật trạng thái vì không đúng ngày học',
    reason: 'SESSION_DATE_MISMATCH' as const
  },
  SESSION_TIME_MISMATCH: {
    message: 'Không thể cập nhật trạng thái vì chưa tới giờ học',
    reason: 'SESSION_TIME_MISMATCH' as const
  }
} as const;
