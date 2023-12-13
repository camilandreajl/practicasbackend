export type UtcOffset = number;

export enum ScheduleType {
  EVERY_DAY = 'EVERY_DAY',
  WEEKDAYS_ONLY = 'WEEKDAYS_ONLY',
}

function isValidUtcOffset(offset: UtcOffset): boolean {
  return offset >= -12 && offset <= 12;
}

export function buildCron(scheduleType: ScheduleType, hour: number, utcOffset: UtcOffset): string {
  if (hour < 0 || hour > 23) {
    throw new Error('Hour must be between 0 and 23.');
  }

  if (!isValidUtcOffset(utcOffset)) {
    throw new Error('UTC Offset must be between -12 and 12.');
  }

  let utcHour = hour - utcOffset;
  if (utcHour < 0) {
    utcHour += 24;
  } else if (utcHour >= 24) {
    utcHour -= 24;
  }

  // For EventBridge, use '?' in Day-of-month when Day-of-week is specified, and vice versa
  const dayOfMonth = scheduleType === ScheduleType.WEEKDAYS_ONLY ? '?' : '*';
  const dayOfWeek = scheduleType === ScheduleType.WEEKDAYS_ONLY ? 'MON-FRI' : '?';

  return `cron(0 ${utcHour} ${dayOfMonth} * ${dayOfWeek} *)`;
}
