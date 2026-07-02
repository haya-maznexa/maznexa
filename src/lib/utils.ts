import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SheetRow, FilterState } from "@/types";

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

// ─── Month options from data ──────────────────────────────────────────────────
// Returns unique months present in the data, newest first, as
// { key: "2025-08", label: "Aug 2025" } for use in the month filter dropdown.

export function monthOptions(rows: SheetRow[]): { key: string; label: string }[] {
  const keys = new Set<string>();
  for (const r of rows) {
    if (r.monthKey && r.monthKey !== "0000-00") keys.add(r.monthKey);
  }
  return Array.from(keys)
    .sort((a, b) => b.localeCompare(a)) // newest first
    .map((key) => {
      const [y, m] = key.split("-");
      const d = new Date(Number(y), Number(m) - 1, 1);
      return {
        key,
        label: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      };
    });
}

// ─── Apply filters to rows ────────────────────────────────────────────────────

export function applyFilters(rows: SheetRow[], filters: FilterState): SheetRow[] {
  let filtered = rows;

  if (filters.months.length > 0)
    filtered = filtered.filter((r) => filters.months.includes(r.monthKey));

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
