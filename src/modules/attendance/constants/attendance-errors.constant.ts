export const ATTENDANCE_ERRORS = {
  SESSION_NOT_FOUND: {
    message: 'Buổi học không tồn tại',
    reason: 'SESSION_NOT_FOUND' as const
  },
  SESSION_NOT_IN_PROGRESS: {
    message: 'Chỉ được điểm danh khi buổi học đang diễn ra',
    reason: 'SESSION_NOT_IN_PROGRESS' as const
  },
  STUDENT_NOT_IN_CLASS: {
    message: 'Học sinh không thuộc lớp của buổi học',
    reason: 'STUDENT_NOT_IN_CLASS' as const
  }
} as const;
