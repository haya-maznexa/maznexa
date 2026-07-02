"use client";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Download,
  ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { useSheetData } from "@/hooks/useSheetData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { exportCSV, exportExcel } from "@/lib/exports";
import { fmt, fmtPct, fmtHours, rateColor } from "@/lib/utils";
import type { SheetRow } from "@/types";

type SortKey = keyof SheetRow;
type SortDir = "asc" | "desc";

const PAGE_SIZES = [20, 50, 100];

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "company",      label: "Brand" },
  { key: "month",        label: "Month" },
  { key: "year",         label: "Year",         align: "right" },
  { key: "service",      label: "Service" },
  { key: "platform",     label: "Platform" },
  { key: "type",         label: "Type" },
  { key: "deliverables", label: "Planned",       align: "right" },
  { key: "delivered",    label: "Delivered",     align: "right" },
  { key: "extra",        label: "Extra",         align: "right" },
  { key: "hDeliverables",label: "H Planned",     align: "right" },
  { key: "hDelivered",   label: "H Actual",      align: "right" },
  { key: "hExtra",       label: "H Extra",       align: "right" },
];

export function DataTable() {
  const { isLoading, filtered } = useSheetData();
  const [sortKey, setSortKey] = useState<SortKey>("monthKey");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [visibleCols, setVisibleCols] = useState<Set<SortKey>>(
    new Set(COLUMNS.map((c) => c.key))
  );

  const searched = useMemo(() => {
    if (!search.trim()) return filtered;
    const q = search.toLowerCase();
    return filtered.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [filtered, search]);

  const sorted = useMemo(() => {
    const arr = [...searched];
    arr.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [searched, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize);

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (col !== sortKey) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-primary" />
      : <ChevronDown className="w-3 h-3 text-primary" />;
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const visibleColumns = COLUMNS.filter((c) => visibleCols.has(c.key));

  return (
    <div className="p-6 space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search table…"
              className="h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-sm outline-none w-52 focus:ring-1 focus:ring-primary"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {sorted.length.toLocaleString()} rows
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Column visibility */}
          <select
            className="h-8 px-2 rounded-lg border border-input bg-background text-xs outline-none"
            onChange={(e) => {
              const key = e.target.value as SortKey;
              setVisibleCols((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
              });
            }}
            value=""
          >
            <option value="" disabled>Columns ▾</option>
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {visibleCols.has(c.key) ? "✓ " : "  "}{c.label}
              </option>
            ))}
          </select>

          {/* Page size */}
          <select
            className="h-8 px-2 rounded-lg border border-input bg-background text-xs outline-none"
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
          >
            {PAGE_SIZES.map((s) => <option key={s} value={s}>{s} / page</option>)}
          </select>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportCSV(sorted)}
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => exportExcel(sorted)}
          >
            <Download className="w-3.5 h-3.5" /> Excel
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 border-b border-border">
              <tr>
                {visibleColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`px-3 py-2.5 font-semibold text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap
                      ${col.align === "right" ? "text-right" : "text-left"}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="px-3 py-2.5 font-semibold text-muted-foreground text-right whitespace-nowrap">Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.map((row, i) => {
                const rate = row.deliverables > 0 ? (row.delivered / row.deliverables) * 100 : 0;
                return (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.01, 0.2) }}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    {visibleColumns.map((col) => (
                      <td key={col.key} className={`px-3 py-2 ${col.align === "right" ? "text-right tabular-nums" : ""}`}>
                        {col.key === "company"
                          ? <span className="font-medium text-foreground">{String(row[col.key])}</span>
                          : col.key === "deliverables" || col.key === "delivered" || col.key === "extra"
                          ? fmt(Number(row[col.key]))
                          : col.key === "hDeliverables" || col.key === "hDelivered" || col.key === "hExtra"
                          ? fmtHours(Number(row[col.key]))
                          : String(row[col.key])}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right">
                      <span className="font-semibold text-[11px]" style={{ color: rateColor(rate) }}>
                        {fmtPct(rate)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={visibleColumns.length + 1} className="py-16 text-center text-muted-foreground text-sm">
                    No data matches your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {Math.min((page - 1) * pageSize + 1, sorted.length)}–{Math.min(page * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-7 w-7 rounded-md text-xs font-medium transition-colors
                    ${p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                >
                  {p}
                </button>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
