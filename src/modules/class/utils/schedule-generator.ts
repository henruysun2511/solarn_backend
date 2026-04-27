import { BadRequestException } from '@nestjs/common';

export function normalizeDate(dateValue: string | Date): Date {
  const date = new Date(dateValue);
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(dateValue: Date, days: number): Date {
  const nextDate = new Date(dateValue);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

export function parseWeekdays(weekdays: string): number[] {
  const values = weekdays
    .split(/[-,\s]+/)
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isInteger(value));

  if (values.length === 0) {
    throw new BadRequestException('Lịch mẫu không hợp lệ');
  }

  const uniqueValues = [...new Set(values)];
  const invalidValues = uniqueValues.filter((value) => value < 2 || value > 8);
  if (invalidValues.length > 0) {
    throw new BadRequestException('Thứ trong lịch mẫu phải nằm trong khoảng 2 đến 8');
  }

  return uniqueValues.sort((left, right) => left - right);
}

export interface GeneratedSession {
  shiftCode: string;
  studyDate: Date;
}

export function generateScheduleSessions(
  startDate: Date,
  weekdays: number[],
  shiftCode: string,
  totalSessions: number
): GeneratedSession[] {
  const sessions: GeneratedSession[] = [];
  let cursorDate = startDate;

  while (sessions.length < totalSessions) {
    const vietnameseWeekday = cursorDate.getUTCDay() === 0 ? 8 : cursorDate.getUTCDay() + 1;
    if (weekdays.includes(vietnameseWeekday)) {
      sessions.push({
        shiftCode,
        studyDate: cursorDate
      });
    }

    cursorDate = addDays(cursorDate, 1);
  }

  return sessions;
}
