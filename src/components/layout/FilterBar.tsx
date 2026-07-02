"use client";
import { X, SlidersHorizontal, CalendarDays } from "lucide-react";
import { useFilterStore } from "@/store/filterStore";
import { useSheetData } from "@/hooks/useSheetData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";

interface Option {
  value: string;
  label: string;
}

function MultiSelectFilter({
  label,
  icon,
  options,
  selected,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  options: Option[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [search, setSearch] = useState("");
  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

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
          {icon}
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
          className="z-50 w-56 rounded-xl bg-popover border border-border shadow-lg p-2 animate-fade-in"
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full h-8 px-3 mb-2 text-xs rounded-lg bg-muted outline-none border border-input"
          />
          <div className="max-h-56 overflow-y-auto scrollbar-thin space-y-0.5">
            {filtered.map((opt) => {
              const checked = selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    onChange(
                      checked
                        ? selected.filter((s) => s !== opt.value)
                        : [...selected, opt.value]
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
                  {opt.label}
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

const toOptions = (values: string[]): Option[] =>
  values.map((v) => ({ value: v, label: v }));

export function FilterBar() {
  const filters = useFilterStore();
  const { filterOptions, monthList } = useSheetData();

  const monthLabel = (key: string) =>
    monthList.find((m) => m.key === key)?.label ?? key;

  const hasActive =
    filters.months.length > 0 ||
    filters.brands.length > 0 ||
    filters.platforms.length > 0 ||
    filters.services.length > 0;

  return (
    <div className="sticky top-16 z-10 flex flex-wrap items-center gap-2 px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border no-print">
      <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />

      {/* Month filter */}
      <MultiSelectFilter
        label="Month"
        icon={<CalendarDays className="w-3.5 h-3.5" />}
        options={monthList.map((m) => ({ value: m.key, label: m.label }))}
        selected={filters.months}
        onChange={filters.setMonths}
      />

      <div className="w-px h-5 bg-border mx-1" />

      {/* Multi-select filters */}
      <MultiSelectFilter
        label="Brand"
        options={toOptions(filterOptions.brands)}
        selected={filters.brands}
        onChange={filters.setBrands}
      />
      <MultiSelectFilter
        label="Platform"
        options={toOptions(filterOptions.platforms)}
        selected={filters.platforms}
        onChange={filters.setPlatforms}
      />
      <MultiSelectFilter
        label="Service"
        options={toOptions(filterOptions.services)}
        selected={filters.services}
        onChange={filters.setServices}
      />

      {/* Active filter chips */}
      {filters.months.map((m) => (
        <Badge key={m} variant="secondary" className="gap-1 cursor-pointer" onClick={() => filters.setMonths(filters.months.filter((x) => x !== m))}>
          {monthLabel(m)} <X className="w-2.5 h-2.5" />
        </Badge>
      ))}
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
