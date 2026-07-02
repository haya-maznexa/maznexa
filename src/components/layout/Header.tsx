"use client";
import { RefreshCw, Moon, Sun, Download, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useSheetData } from "@/hooks/useSheetData";
import { useFilterStore } from "@/store/filterStore";
import { exportCSV, exportExcel, exportPDF } from "@/lib/exports";
import { formatDistanceToNow } from "date-fns";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useState } from "react";

const PAGE_LABELS: Record<string, string> = {
  overview: "Executive Overview",
  performance: "Performance Dashboard",
  brands: "Brand Analytics",
  platforms: "Platform Analytics",
  services: "Service Analytics",
  financial: "Workload Analytics",
  trends: "Trends",
  data: "Data Table",
};

export function Header({ view }: { view: string }) {
  const { theme, setTheme } = useTheme();
  const { filtered, updatedAt, refetch, isLoading } = useSheetData();
  const { setSearchQuery, searchQuery } = useFilterStore();
  const [searchOpen, setSearchOpen] = useState(false);

  const lastUpdated = updatedAt
    ? `Updated ${formatDistanceToNow(new Date(updatedAt), { addSuffix: true })}`
    : "Loading…";

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 h-16 px-6 bg-background/80 backdrop-blur-md border-b border-border no-print">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-lg font-semibold truncate">{PAGE_LABELS[view] ?? "Dashboard"}</h1>
        <span className="hidden md:block text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {lastUpdated}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className={cn(
          "flex items-center gap-2 rounded-lg border border-input bg-background transition-all duration-200",
          searchOpen ? "w-52 px-3" : "w-9 px-2"
        )}>
          <Search
            className="w-4 h-4 text-muted-foreground shrink-0 cursor-pointer"
            onClick={() => setSearchOpen(!searchOpen)}
          />
          {searchOpen && (
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setSearchOpen(false)}
              placeholder="Search…"
              className="flex-1 h-8 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          )}
        </div>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          title="Refresh data"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>

        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="w-4 h-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Export */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              className="z-50 min-w-[140px] rounded-xl bg-popover border border-border shadow-lg p-1 animate-fade-in"
            >
              {[
                { label: "CSV", action: () => exportCSV(filtered) },
                { label: "Excel", action: () => exportExcel(filtered) },
                { label: "PDF (Print)", action: () => exportPDF() },
              ].map((item) => (
                <DropdownMenu.Item
                  key={item.label}
                  onSelect={item.action}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-muted outline-none"
                >
                  {item.label}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
