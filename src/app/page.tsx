"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/layout/FilterBar";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { PerformanceDashboard } from "@/components/dashboard/PerformanceDashboard";
import { BrandAnalytics } from "@/components/dashboard/BrandAnalytics";
import { PlatformAnalytics } from "@/components/dashboard/PlatformAnalytics";
import { ServiceAnalytics } from "@/components/dashboard/ServiceAnalytics";
import { FinancialDashboard } from "@/components/dashboard/FinancialDashboard";
import { Trends } from "@/components/dashboard/Trends";
import { DataTable } from "@/components/dashboard/DataTable";
import { useSheetData } from "@/hooks/useSheetData";

import type { DashboardView } from "@/types";

const VIEWS: Record<DashboardView, React.ComponentType> = {
  overview:    ExecutiveOverview,
  performance: PerformanceDashboard,
  brands:      BrandAnalytics,
  platforms:   PlatformAnalytics,
  services:    ServiceAnalytics,
  financial:   FinancialDashboard,
  trends:      Trends,
  data:        DataTable,
};

function ErrorBanner() {
  const { isError, error } = useSheetData();
  if (!isError) return null;
  return (
    <div className="mx-6 mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <AlertCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
      <div>
        <p className="text-sm font-semibold text-red-700 dark:text-red-400">Failed to load data</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {String((error as Error)?.message ?? "Unknown error")} — check your network or sheet access.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [view, setView] = useState<DashboardView>("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActiveView = VIEWS[view];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        view={view}
        onViewChange={(v) => setView(v)}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header view={view} />
        <FilterBar />

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <ErrorBanner />
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
