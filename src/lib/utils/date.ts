/**
 * Pure date calculation utilities with zero external dependencies.
 */

export function parseDate(dateStr: string): Date {
  // Supports YYYY-MM-DD or YYYY-MM
  const parts = dateStr.split("-").map(Number);
  if (parts.length === 2) {
    return new Date(parts[0], parts[1] - 1, 1);
  }
  return new Date(parts[0], parts[1] - 1, parts[2] || 1);
}

export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? parseDate(date) : date;
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatFullDate(date: Date | string): string {
  const d = typeof date === "string" ? parseDate(date) : date;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  result.setMonth(result.getMonth() + months);
  return result;
}

export function differenceInMonths(dateLeft: Date, dateRight: Date): number {
  const yearDiff = dateLeft.getFullYear() - dateRight.getFullYear();
  const monthDiff = dateLeft.getMonth() - dateRight.getMonth();
  return yearDiff * 12 + monthDiff;
}

export function differenceInDays(dateLeft: Date, dateRight: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((dateLeft.getTime() - dateRight.getTime()) / MS_PER_DAY);
}
