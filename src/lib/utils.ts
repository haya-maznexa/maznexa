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

// ─── MazNexa brand chart palette ─────────────────────────────────────────────
// Purple / violet / indigo family derived from the brand gradient
// (#5053C8 → #BE98FF) with supporting blues for contrast.

export const CHART_COLORS = [
  "#5053C8", // brand primary indigo
  "#BE98FF", // brand accent violet
  "#7B6FE0", // mid purple
  "#8B5CF6", // violet
  "#B5B9FE", // supporting periwinkle
  "#6366F1", // indigo
  "#A78BFA", // light violet
  "#4F46E5", // deep indigo
  "#818CF8", // soft indigo
  "#C4B5FD", // lavender
  "#7C93F5", // blue-violet
  "#9B8AFB", // pastel purple
];

// Brand gradient stops for use in chart <defs>
export const BRAND_PRIMARY = "#5053C8";
export const BRAND_ACCENT = "#BE98FF";
export const BRAND_SUPPORT = "#B5B9FE";
export const BRAND_SECONDARY = "#CFE7FE";

export function getColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

export function rateColor(rate: number): string {
  if (rate >= 95) return "#10B981"; // green — on/over target
  if (rate >= 80) return "#5053C8"; // brand — healthy
  if (rate >= 60) return "#F59E0B"; // amber — watch
  return "#EF4444";                 // red — at risk
}
