"use client";
import { X, CalendarDays, SlidersHorizontal } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { useSheetData } from "@/hooks/useSheetData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DatePreset } from "@/types";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "allTime",     label: "All Time" },
  { id: "thisMonth",   label: "This Month" },
  { id: "prevMonth",   label: "Last Month" },
  { id: "thisQuarter", label: "This Quarter" },
  { id: "thisYear",    label: "This Year" },
  { id: "last30",      label: "Last 30 Days" },
  { id: "last7",       label: "Last 7 Days" },
];

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-sm transition-colors",
            selected.length > 0
              ? "border-primary bg-primary/10 text-primary font-medium"
              : "border-input bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          {label}
          {selected.length > 0 && (
            <Badge variant="default" className="ml-0.5 h-4 px-1 text-[10px]">
              {selected.length}
            </Badge>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-52 rounded-xl bg-popover border border-border shadow-lg p-2 animate-fade-in"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full h-8 px-3 mb-2 text-xs rounded-lg bg-muted outline-none border border-input"
          />
          <div className="max-h-48 overflow-y-auto scrollbar-thin space-y-0.5">
            {filtered.map((opt) => {
              const checked = selected.includes(opt);
              return (
                <button
                  key={opt}
                  onClick={() =>
                    onChange(
                      checked ? selected.filter((s) => s !== opt) : [...selected, opt]
                    )
                  }
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs text-left hover:bg-muted transition-colors",
                    checked && "bg-primary/10 text-primary font-medium"
                  )}
                >
                  <span
                    className={cn(
                      "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                      checked ? "bg-primary border-primary" : "border-input"
                    )}
                  >
                    {checked && <span className="block w-1.5 h-1.5 bg-white rounded-sm" />}
                  </span>
                  {opt}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">No results</p>
            )}
          </div>
          {selected.length > 0 && (
            <button
              onClick={() => onChange([])}
              className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground py-1"
            >
              Clear selection
            </button>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function FilterBar() {
  const filters = useFilterStore();
  const { filterOptions } = useSheetData();

  const hasActive =
    filters.preset !== "allTime" ||
    filters.brands.length > 0 ||
    filters.platforms.length > 0 ||
    filters.services.length > 0;

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border no-print">
      <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />

      {/* Date presets */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => filters.setPreset(p.id)}
            className={cn(
              "h-7 px-2.5 rounded-md text-xs font-medium transition-all",
              filters.preset === p.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-1" />

      {/* Multi-select filters */}
      <MultiSelectFilter
        label="Brand"
        options={filterOptions.brands}
        selected={filters.brands}
        onChange={filters.setBrands}
      />
      <MultiSelectFilter
        label="Platform"
        options={filterOptions.platforms}
        selected={filters.platforms}
        onChange={filters.setPlatforms}
      />
      <MultiSelectFilter
        label="Service"
        options={filterOptions.services}
        selected={filters.services}
        onChange={filters.setServices}
      />

      {/* Active filter chips */}
      {filters.brands.map((b) => (
        <Badge key={b} variant="secondary" className="gap-1 cursor-pointer" onClick={() => filters.setBrands(filters.brands.filter((x) => x !== b))}>
          {b} <X className="w-2.5 h-2.5" />
        </Badge>
      ))}
      {filters.platforms.map((p) => (
        <Badge key={p} variant="secondary" className="gap-1 cursor-pointer" onClick={() => filters.setPlatforms(filters.platforms.filter((x) => x !== p))}>
          {p} <X className="w-2.5 h-2.5" />
        </Badge>
      ))}
      {filters.services.map((s) => (
        <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => filters.setServices(filters.services.filter((x) => x !== s))}>
          {s} <X className="w-2.5 h-2.5" />
        </Badge>
      ))}

      {hasActive && (
        <Button variant="ghost" size="sm" onClick={filters.reset} className="ml-auto gap-1 text-muted-foreground h-8">
          <X className="w-3.5 h-3.5" /> Reset
        </Button>
      )}
    </div>
  );
}
