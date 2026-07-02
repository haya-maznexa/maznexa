import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SheetRow, FilterState } from "@/types";
import { startOfMonth, endOfMonth, subDays, subMonths, startOfQuarter, endOfQuarter, startOfYear } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: decimals });
}

export function fmtPct(n: number): string {
  return `${n.toFixed(1)}%`;
}

export function fmtHours(h: number): string {
  if (h >= 1000) return `${(h / 1000).toFixed(1)}k h`;
  return `${h.toFixed(0)}h`;
}

export function shortMonthLabel(monthKey: string): string {
  const [y, m] = monthKey.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

// ─── Date range from preset ───────────────────────────────────────────────────
// `reference` is the anchor date. For historical sheet data we anchor to the
// latest month present in the data, so "This Month", "Last 30 Days" etc. stay
// meaningful even when the sheet is not up to the current real-world date.

export function resolveDateRange(
  filters: FilterState,
  reference?: Date
): { from: Date; to: Date } | null {
  const anchor = reference ?? new Date();
  switch (filters.preset) {
    case "last7":
      return { from: subDays(anchor, 6), to: anchor };
    case "last30":
      return { from: subDays(anchor, 29), to: anchor };
    case "thisMonth":
      return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
    case "prevMonth": {
      const prev = subMonths(anchor, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "thisQuarter":
      return { from: startOfQuarter(anchor), to: endOfQuarter(anchor) };
    case "thisYear":
      return { from: startOfYear(anchor), to: endOfMonth(anchor) };
    case "allTime":
      return null;
    case "custom":
      return filters.dateRange.from && filters.dateRange.to
        ? { from: filters.dateRange.from, to: filters.dateRange.to }
        : null;
    default:
      return null;
  }
}

// Latest month present in the dataset (used as the date-filter anchor).
function latestDataDate(rows: SheetRow[]): Date | undefined {
  let max: Date | undefined;
  for (const r of rows) {
    if (!r.monthKey || r.monthKey === "0000-00") continue;
    const d = new Date(r.year, r.monthIndex - 1, 1);
    if (!max || d > max) max = d;
  }
  // anchor to the end of that month so the whole month is included
  return max ? endOfMonth(max) : undefined;
}

// ─── Apply filters to rows ────────────────────────────────────────────────────

export function applyFilters(rows: SheetRow[], filters: FilterState): SheetRow[] {
  let filtered = rows;

  const reference = latestDataDate(rows);
  const range = resolveDateRange(filters, reference);
  if (range) {
    filtered = filtered.filter((r) => {
      if (!r.monthKey || r.monthKey === "0000-00") return true;
      // A row represents a whole month; include it if that month overlaps the range.
      const monthStart = new Date(r.year, r.monthIndex - 1, 1);
      const monthEnd = endOfMonth(monthStart);
      return monthEnd >= range.from && monthStart <= range.to;
    });
  }

  if (filters.brands.length > 0)
    filtered = filtered.filter((r) => filters.brands.includes(r.company));
  if (filters.platforms.length > 0)
    filtered = filtered.filter((r) => filters.platforms.includes(r.platform));
  if (filters.services.length > 0)
    filtered = filtered.filter((r) => filters.services.includes(r.service));
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }

  return filtered;
}

// ─── Unique values ────────────────────────────────────────────────────────────

export function uniqueValues<K extends keyof SheetRow>(rows: SheetRow[], key: K): string[] {
  return Array.from(new Set(rows.map((r) => String(r[key])))).filter(Boolean).sort();
}

// ─── Chart colour palette (neutral, works on any brand) ──────────────────────

export const CHART_COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#06B6D4", // cyan
  "#EC4899", // pink
  "#84CC16", // lime
  "#F97316", // orange
  "#6366F1", // indigo
  "#14B8A6", // teal
  "#A855F7", // purple
];

export function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function rateColor(rate: number): string {
  if (rate >= 95) return "#10B981";
  if (rate >= 80) return "#3B82F6";
  if (rate >= 60) return "#F59E0B";
  return "#EF4444";
}
