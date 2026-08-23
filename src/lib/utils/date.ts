/**
 * Pure date calculation utilities with zero external dependencies.
 */

export function parseDate(dateStr: string): Date {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date();
  }
  // If it's already an ISO or date-like string
  const parts = dateStr.trim().split("-").map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    if (parts.length === 2) {
      return new Date(parts[0], parts[1] - 1, 1);
    }
    return new Date(parts[0], parts[1] - 1, parts[2] || 1);
  }
  const timestamp = Date.parse(dateStr);
  if (!isNaN(timestamp)) {
    return new Date(timestamp);
  }
  return new Date();
}

export function formatDateToISO(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return new Date().toISOString().split("T")[0];
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return "Pace Dependent";
  if (typeof date === "string") {
    if (
      date.toLowerCase().includes("not arrive") ||
      date.toLowerCase().includes("invalid") ||
      date.toLowerCase().includes("at risk") ||
      date.toLowerCase().includes("hold") ||
      date.toLowerCase().includes("deficit")
    ) {
      return "Pace Dependent";
    }
    const d = parseDate(date);
    if (isNaN(d.getTime())) return "Pace Dependent";
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }
  if (isNaN(date.getTime())) return "Pace Dependent";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatFullDate(date: Date | string | null | undefined): string {
  if (!date) return "Pace Dependent";
  if (typeof date === "string") {
    if (
      date.toLowerCase().includes("not arrive") ||
      date.toLowerCase().includes("invalid") ||
      date.toLowerCase().includes("at risk") ||
      date.toLowerCase().includes("hold") ||
      date.toLowerCase().includes("deficit")
    ) {
      return "Pace Dependent";
    }
    const d = parseDate(date);
    if (isNaN(d.getTime())) return "Pace Dependent";
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  }
  if (isNaN(date.getTime())) return "Pace Dependent";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
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
