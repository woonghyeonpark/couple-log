import { formatInTimeZone } from "date-fns-tz";

export const TZ = "Asia/Seoul";

/** Asia/Seoul 기준 오늘 날짜 (yyyy-MM-dd) */
export function seoulToday(now: Date = new Date()): string {
  return formatInTimeZone(now, TZ, "yyyy-MM-dd");
}

function parse(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function format(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  const d = parse(date);
  d.setUTCDate(d.getUTCDate() + days);
  return format(d);
}

/** 해당 날짜가 속한 주의 월요일 (월~일 기준) */
export function mondayOf(date: string): string {
  const dow = parse(date).getUTCDay(); // 0=일
  return addDays(date, dow === 0 ? -6 : 1 - dow);
}

/** 투표 대상 주의 월요일. 일요일부터는 다가오는 주말을 위한 다음 주로 본다. */
export function getVoteWeek(now: Date = new Date()): string {
  const today = seoulToday(now);
  const dow = parse(today).getUTCDay();
  return dow === 0 ? addDays(today, 1) : mondayOf(today);
}

/** 그 주 토요일 (일정 기본 날짜) */
export function saturdayOf(weekOf: string): string {
  return addDays(weekOf, 5);
}
