import { format, parseISO, differenceInDays, startOfWeek, endOfWeek, subDays, isToday } from "date-fns";

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d");
}

export function formatShortDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d");
}

export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "h:mm a");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function daysAgo(n: number): string {
  return format(subDays(new Date(), n), "yyyy-MM-dd");
}

export function getWeekRange(date: Date = new Date()) {
  return {
    start: format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
    end: format(endOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd"),
  };
}

export function daysBetween(a: string, b: string): number {
  return Math.abs(differenceInDays(parseISO(a), parseISO(b)));
}

export function isTodayStr(dateStr: string): boolean {
  return isToday(parseISO(dateStr));
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => daysAgo(6 - i));
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => daysAgo(29 - i));
}
