"use client";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { SheetRow } from "@/types";
import { useFilterStore } from "@/store/filterStore";
import { applyFilters } from "@/lib/utils";
import {
  computeKPIs,
  computeByBrand,
  computeByPlatform,
  computeByService,
  computeByMonth,
  computeTrends,
  generateInsights,
} from "@/lib/analytics";

const REFRESH_MS = Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL ?? 30_000);

async function fetchSheetData(): Promise<{ rows: SheetRow[]; updatedAt: string }> {
  const res = await fetch("/api/sheets", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load data");
  return res.json();
}

export function useSheetData() {
  const filters = useFilterStore();

  const query = useQuery({
    queryKey: ["sheets"],
    queryFn: fetchSheetData,
    refetchInterval: REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: REFRESH_MS,
  });

  const allRows = useMemo(() => query.data?.rows ?? [], [query.data?.rows]);

  const filtered = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);

  const byBrand = useMemo(() => computeByBrand(filtered), [filtered]);
  const byPlatform = useMemo(() => computeByPlatform(filtered), [filtered]);
  const byService = useMemo(() => computeByService(filtered), [filtered]);
  const byMonth = useMemo(() => computeByMonth(filtered), [filtered]);
  const trends = useMemo(() => computeTrends(byMonth), [byMonth]);
  const kpis = useMemo(() => computeKPIs(filtered), [filtered]);
  const insights = useMemo(
    () => generateInsights(filtered, kpis, byBrand, byPlatform, byService, trends),
    [filtered, kpis, byBrand, byPlatform, byService, trends]
  );

  // Unique filter options from ALL rows (not filtered)
  const filterOptions = useMemo(
    () => ({
      brands: [...new Set(allRows.map((r) => r.company))].filter(Boolean).sort(),
      platforms: [...new Set(allRows.map((r) => r.platform))].filter((p) => p && p !== "-").sort(),
      services: [...new Set(allRows.map((r) => r.service))].filter(Boolean).sort(),
    }),
    [allRows]
  );

  return {
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updatedAt: query.data?.updatedAt,
    allRows,
    filtered,
    kpis,
    byBrand,
    byPlatform,
    byService,
    byMonth,
    trends,
    insights,
    filterOptions,
    refetch: query.refetch,
  };
}
